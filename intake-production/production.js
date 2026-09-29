(() => {
  "use strict";

  const SESSION_KEY = "qaj_intake_submission_id";
  const API_URL = "https://viajmvbwpmkiqxjtgshv.supabase.co/functions/v1/qaj-intake-submit-v9";
  const KB = 1024;
  const MB = 1024 * KB;
  const IMAGE_KEEP_LIMIT = 900 * KB;
  const IMAGE_SOFT_LIMIT = 1.2 * MB;
  const PDF_LIMIT = 2 * MB;
  const IMAGE_RAW_LIMIT = 6 * MB;
  const AUDIO_LIMIT = 12 * MB;
  const DEFAULT_RECEIPT_COPY = "Choose a clear photo/screenshot, or a PDF up to 2 MB";

  let receiptState = { source: null, file: null, originalSize: 0, optimised: false, error: "" };
  let preparationToken = 0;
  let submitting = false;

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "";
    if (bytes < KB) return `${bytes} bytes`;
    if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
    return `${(bytes / MB).toFixed(bytes >= 10 * MB ? 0 : 1)} MB`;
  }

  function extension(file) {
    return (file?.name?.split(".").pop() || "").toLowerCase();
  }

  function isPdf(file) {
    return file?.type === "application/pdf" || extension(file) === "pdf";
  }

  function isImage(file) {
    return Boolean(file && (file.type.startsWith("image/") || ["heic", "heif"].includes(extension(file))));
  }

  function makeUuid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    globalThis.crypto?.getRandomValues?.(bytes);
    if (!bytes.some(Boolean)) {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function readStoredId() {
    try { return sessionStorage.getItem(SESSION_KEY) || ""; } catch { return ""; }
  }

  function writeStoredId(value) {
    try { sessionStorage.setItem(SESSION_KEY, value); } catch { /* Private-mode storage can be unavailable. */ }
  }

  function clearStoredId() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* No-op. */ }
  }

  function ensureSubmissionId(form, forceNew = false) {
    const input = form.elements.namedItem("submission_id");
    if (!input) return "";
    const stored = forceNew ? "" : readStoredId();
    const current = forceNew ? "" : input.value;
    const id = stored || current || makeUuid();
    input.value = id;
    writeStoredId(id);
    return id;
  }

  function setReceiptUi(form, state, detail = "", kind = "") {
    const panel = form.querySelector("[data-receipt-preparation]");
    const heading = form.querySelector("[data-receipt-state]");
    const copy = form.querySelector("[data-receipt-detail]");
    const card = form.elements.namedItem("payment_receipt")?.closest(".upload-card");
    if (!panel || !heading || !copy) return;
    panel.hidden = !state;
    heading.textContent = state;
    copy.textContent = detail;
    panel.classList.toggle("is-error", kind === "error");
    panel.classList.toggle("is-ready", kind === "ready");
    card?.classList.toggle("is-preparing", kind === "preparing");
    card?.classList.toggle("is-error", kind === "error");
  }

  function setProgress(form, percent, visible = true) {
    const rail = form.querySelector("[data-upload-progress]");
    const bar = form.querySelector("[data-upload-progress-bar]");
    if (!rail || !bar) return;
    rail.hidden = !visible;
    bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image-decode-failed"));
      };
      image.src = url;
    });
  }

  async function optimiseImage(file) {
    if (file.size <= IMAGE_KEEP_LIMIT) return { file, optimised: false };

    const image = await loadImage(file);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    if (!naturalWidth || !naturalHeight) throw new Error("image-decode-failed");

    const longEdge = Math.max(naturalWidth, naturalHeight);
    let scale = Math.min(1, 1800 / longEdge);
    let width = Math.max(1, Math.round(naturalWidth * scale));
    let height = Math.max(1, Math.round(naturalHeight * scale));
    const qualities = [0.84, 0.78, 0.72];
    let best = null;

    for (let resizePass = 0; resizePass < 3; resizePass += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("canvas-unavailable");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, width, height);

      for (const quality of qualities) {
        const blob = await canvasBlob(canvas, "image/jpeg", quality);
        if (!blob) continue;
        best = blob;
        if (blob.size <= 900 * KB) break;
      }
      if (best && best.size <= IMAGE_SOFT_LIMIT) break;
      if (Math.max(width, height) <= 1200) break;
      const nextScale = Math.max(1200 / Math.max(width, height), 0.84);
      width = Math.max(1, Math.round(width * nextScale));
      height = Math.max(1, Math.round(height * nextScale));
    }

    if (!best) throw new Error("image-encode-failed");
    return {
      file: new File([best], "payment-receipt.jpg", { type: "image/jpeg", lastModified: Date.now() }),
      optimised: true
    };
  }

  async function prepareReceipt(form, file) {
    const token = ++preparationToken;
    receiptState = { source: file || null, file: null, originalSize: file?.size || 0, optimised: false, error: "" };
    setProgress(form, 0, false);

    if (!file) {
      setReceiptUi(form, "", "");
      return receiptState;
    }

    if (isPdf(file)) {
      if (file.size > PDF_LIMIT) {
        receiptState.error = "This PDF is too large for a reliable mobile upload. Please upload a screenshot/photo of the receipt instead, or a PDF smaller than 2 MB.";
        setReceiptUi(form, "File too large", `${formatBytes(file.size)} PDF · Please use a screenshot/photo instead.`, "error");
        return receiptState;
      }
      receiptState.file = file;
      setReceiptUi(form, "Receipt ready", `${formatBytes(file.size)} PDF`, "ready");
      return receiptState;
    }

    if (!isImage(file)) {
      receiptState.error = "Please choose a receipt photo, screenshot or PDF.";
      setReceiptUi(form, "File not supported", receiptState.error, "error");
      return receiptState;
    }

    if (file.size > IMAGE_RAW_LIMIT * 3) {
      receiptState.error = "This photo is too large to prepare reliably. Please take a screenshot of the receipt and upload the screenshot instead.";
      setReceiptUi(form, "Photo too large", receiptState.error, "error");
      return receiptState;
    }

    setReceiptUi(form, "Preparing receipt…", `${formatBytes(file.size)} original`, "preparing");
    try {
      const result = await optimiseImage(file);
      if (token !== preparationToken) return receiptState;
      receiptState.file = result.file;
      receiptState.optimised = result.optimised;
      const detail = result.optimised
        ? `Original: ${formatBytes(file.size)} · Optimised: ${formatBytes(result.file.size)}`
        : formatBytes(result.file.size);
      setReceiptUi(form, "Receipt ready", detail, "ready");
    } catch {
      if (token !== preparationToken) return receiptState;
      if (file.size <= IMAGE_SOFT_LIMIT) {
        receiptState.file = file;
        setReceiptUi(form, "Receipt ready", `${formatBytes(file.size)} · Original image kept`, "ready");
      } else {
        receiptState.error = "This photo is too large to prepare reliably on this browser. Please take a screenshot of the receipt and upload the screenshot instead.";
        setReceiptUi(form, "Could not prepare this photo", receiptState.error, "error");
      }
    }
    return receiptState;
  }

  function visibleInvalidControl(form) {
    return [...form.querySelectorAll("input, select, textarea")].find(control => {
      if (control.disabled || control.type === "hidden" || control.closest("[hidden]")) return false;
      return !control.checkValidity();
    });
  }

  function validateGroups(form) {
    let invalid = null;
    form.querySelectorAll("[data-min-checks]").forEach(group => {
      if (group.hidden || group.closest("[hidden]")) return;
      const count = group.querySelectorAll('input[type="checkbox"]:checked').length;
      const failed = count < Number(group.dataset.minChecks || 0);
      group.classList.toggle("invalid", failed);
      if (failed && !invalid) invalid = group;
    });
    return invalid;
  }

  function showFormError(form, message, target = null) {
    const box = form.querySelector("[data-form-status]");
    if (box) {
      box.textContent = message;
      box.hidden = false;
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    target?.setAttribute?.("aria-invalid", "true");
    target?.focus?.({ preventScroll: true });
    target?.closest?.(".field, .question-block, .upload-card")?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }

  function validateForSubmit(form) {
    const payment = form.elements.namedItem("payment_receipt");
    const audio = form.elements.namedItem("test_me_audio");
    if (audio?.files?.[0]?.size > AUDIO_LIMIT) {
      audio.setCustomValidity("Audio file must be 12 MB or smaller.");
    }
    const invalidControl = visibleInvalidControl(form);
    const invalidGroup = validateGroups(form);
    if (invalidControl || invalidGroup) {
      invalidControl?.reportValidity?.();
      showFormError(form, "Please complete the highlighted answer before continuing.", invalidControl || invalidGroup);
      return false;
    }
    if (!payment?.files?.[0]) {
      showFormError(form, "Please attach the payment receipt before submitting.", payment);
      return false;
    }
    if (receiptState.error) {
      showFormError(form, receiptState.error, payment);
      return false;
    }
    return true;
  }

  function browserFamily() {
    const ua = navigator.userAgent || "";
    if (/Instagram/i.test(ua)) return "instagram-in-app";
    if (/FBAN|FBAV/i.test(ua)) return "facebook-in-app";
    if (/SamsungBrowser/i.test(ua)) return "samsung-internet";
    if (/CriOS/i.test(ua)) return "ios-chrome";
    if (/iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua)) return "ios-safari";
    if (/Android/i.test(ua) && /Chrome/i.test(ua)) return "android-chrome";
    if (/Firefox/i.test(ua)) return "firefox";
    if (/Chrome/i.test(ua)) return "chrome";
    if (/Safari/i.test(ua)) return "safari";
    return "other";
  }

  function showSuccess(form) {
    form.hidden = true;
    const info = document.querySelector("[data-course-info]");
    const success = document.querySelector("[data-success]");
    if (info) info.hidden = true;
    if (success) success.hidden = false;
    const kicker = document.querySelector("[data-dialog-kicker]");
    const title = document.querySelector("[data-dialog-title]");
    if (kicker) kicker.textContent = "Registration received";
    if (title) title.textContent = "Submitted successfully";
    document.querySelector("[data-intake-dialog]")?.scrollTo?.({ top: 0, behavior: "smooth" });
    success?.focus?.({ preventScroll: true });
  }

  function submitWithProgress(form, submitButton, data) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", API_URL, true);
      xhr.responseType = "json";
      xhr.timeout = 300000;
      xhr.setRequestHeader("Accept", "application/json");

      xhr.upload.onprogress = event => {
        if (!event.lengthComputable) {
          setReceiptUi(form, "Uploading receipt…", "Please keep this page open.", "preparing");
          return;
        }
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        setReceiptUi(form, `Uploading receipt… ${percent}%`, `${formatBytes(event.loaded)} of ${formatBytes(event.total)}`, "preparing");
        setProgress(form, percent, true);
      };

      xhr.upload.onload = () => {
        setProgress(form, 100, true);
        setReceiptUi(form, "Saving registration…", "The receipt has uploaded. QAJ is confirming the registration.", "preparing");
      };

      xhr.onload = () => {
        let body = xhr.response;
        if (!body && xhr.responseText) {
          try { body = JSON.parse(xhr.responseText); } catch { body = null; }
        }
        if (xhr.status >= 200 && xhr.status < 300 && body?.ok === true) resolve(body);
        else reject(new Error(body?.error || "We could not complete the registration. Please try again."));
      };
      xhr.onerror = () => reject(new Error("The connection was interrupted. Your answers are still here, and retrying is safe."));
      xhr.ontimeout = () => reject(new Error("The upload did not finish in time. Your answers are still here, and retrying is safe."));
      xhr.onabort = () => reject(new Error("The upload was stopped. Your answers are still here."));
      xhr.send(data);
    });
  }

  async function handleSubmit(event, form) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (submitting) return;

    const paymentInput = form.elements.namedItem("payment_receipt");
    const sourceFile = paymentInput?.files?.[0];
    if (sourceFile && (receiptState.source !== sourceFile || !receiptState.file)) await prepareReceipt(form, sourceFile);
    if (!validateForSubmit(form)) return;

    const submitButton = event.submitter || form.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.innerHTML || "Submit registration";
    submitting = true;
    form.setAttribute("aria-busy", "true");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Preparing receipt…";
    }

    try {
      const id = ensureSubmissionId(form);
      const data = new FormData(form);
      data.set("submission_id", id);
      data.set("payment_receipt", receiptState.file, receiptState.file.name || "payment-receipt");
      data.set("receipt_original_bytes", String(receiptState.originalSize));
      data.set("receipt_upload_bytes", String(receiptState.file.size));
      data.set("receipt_optimised", String(receiptState.optimised));
      data.set("client_browser_family", browserFamily());
      data.set("client_api_version", "v9-direct-mobile");
      await submitWithProgress(form, submitButton, data);
      setReceiptUi(form, "Registration received", "QAJ confirmed the registration and receipt.", "ready");
      clearStoredId();
      showSuccess(form);
    } catch (error) {
      setProgress(form, 0, false);
      setReceiptUi(form, "Upload not completed", error?.message || "Please try again.", "error");
      showFormError(form, error?.message || "We could not complete the registration. Please try again.");
    } finally {
      submitting = false;
      form.removeAttribute("aria-busy");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalLabel;
      }
    }
  }

  function initialise() {
    const form = document.querySelector("#registration-form");
    if (!form) return;
    ensureSubmissionId(form);

    form.addEventListener("submit", event => handleSubmit(event, form), true);

    form.addEventListener("change", event => {
      const control = event.target;
      if (control?.name === "payment_receipt") prepareReceipt(form, control.files?.[0] || null);
    });

    form.addEventListener("reset", () => {
      preparationToken += 1;
      receiptState = { source: null, file: null, originalSize: 0, optimised: false, error: "" };
      setReceiptUi(form, "", "");
      setProgress(form, 0, false);
      requestAnimationFrame(() => {
        const label = form.querySelector('[name="payment_receipt"]')?.closest(".upload-card")?.querySelector("[data-file-name]");
        if (label) label.textContent = DEFAULT_RECEIPT_COPY;
      });
    });

    document.addEventListener("click", event => {
      if (event.target.closest("[data-next], [data-back], [data-register], [data-register-course], [data-register-from-info]")) {
        requestAnimationFrame(() => {
          const active = form.querySelector("[data-step]:not([hidden]) h2");
          if (active) {
            active.tabIndex = -1;
            active.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
      if (event.target.closest("[data-start-over]")) {
        clearStoredId();
        requestAnimationFrame(() => ensureSubmissionId(form, true));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initialise);
})();
