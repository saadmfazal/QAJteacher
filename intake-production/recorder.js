(() => {
  "use strict";
  const LIMIT = 12 * 1024 * 1024;
  const MAX_SECONDS = 300;
  const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';
  const STOP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';
  let form, modal, input, stream, recorder, file, draftUrl = "", attachedUrl = "";
  let state = "idle", token = 0, chunks = [], bytes = 0, elapsed = 0, startedAt = 0, timer = 0;
  let returnFocus, zoom = 100, discardTake = false, captureError = "";

  function setError(message = "") {
    const box = modal.querySelector("[data-recorder-error]");
    box.textContent = message;
    box.hidden = !message;
  }

  function clock(seconds) {
    return `${Math.floor(seconds / 60).toString().padStart(2,"0")}:${Math.floor(seconds % 60).toString().padStart(2,"0")}`;
  }

  function setState(next) {
    state = next;
    modal.dataset.state = next;
    const main = modal.querySelector("[data-recorder-main]");
    const secondary = modal.querySelector("[data-recorder-secondary]");
    const labels = {
      idle: ["Ready to recite", `${MIC}Start recording`, "", "Allow microphone access when your browser asks. Up to 5 minutes."],
      requesting: ["Waiting for microphone…", "Allow microphone access", "", "Your browser may ask for microphone permission."],
      recording: ["Recording your recitation", `${STOP}Stop recording`, "Pause", "Keep reciting while you scroll. Tap Stop when you finish Ayah 5."],
      paused: ["Recording paused", `${STOP}Finish recording`, "Resume", "Tap Resume to continue the same recording."],
      stopping: ["Preparing your audio…", "Preparing…", "", "Your recording is being prepared for playback."],
      review: ["Listen before attaching", "Use this recording", "Record again", "Your audio is sent to QAJ with your completed registration."],
      unsupported: ["Upload a recording", "Recording unavailable", "", "This browser cannot record here. You can still read the page and upload an audio file."]
    };
    const [status, label, other, note] = labels[next];
    modal.querySelector("[data-recorder-status]").textContent = status;
    main.innerHTML = label;
    main.disabled = ["requesting", "stopping", "unsupported"].includes(next);
    secondary.textContent = other;
    secondary.hidden = !other;
    modal.querySelector("[data-recorder-note]").textContent = note;
    modal.querySelector("[data-recorder-playback]").hidden = next !== "review";
    modal.querySelector("[data-recorder-fallback]").hidden = ["requesting", "recording", "paused", "stopping"].includes(next);
  }

  function releaseStream() {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
  }

  function revokeDraft() {
    const player = modal.querySelector("[data-recorder-player]");
    player.pause();
    player.removeAttribute("src");
    player.load();
    if (draftUrl) URL.revokeObjectURL(draftUrl);
    draftUrl = "";
    file = null;
  }

  function updateTime() {
    const seconds = elapsed + (state === "recording" ? (performance.now() - startedAt) / 1000 : 0);
    modal.querySelector("[data-recorder-time]").textContent = clock(Math.min(MAX_SECONDS,seconds));
    if (seconds >= MAX_SECONDS && state === "recording") stopRecording();
  }

  function stopRecording(discard = false) {
    if (!["recording", "paused"].includes(state)) return;
    if (state === "recording") elapsed += (performance.now() - startedAt) / 1000;
    discardTake = discard;
    clearInterval(timer);
    setState("stopping");
    try { if (recorder?.state !== "inactive") recorder.stop(); } catch { captureError = "The recording was interrupted. Please record again."; }
    releaseStream();
  }

  function resetTake() {
    token += 1;
    if (["recording", "paused"].includes(state)) stopRecording(true);
    releaseStream();
    clearInterval(timer);
    revokeDraft();
    elapsed = 0;
    modal.querySelector("[data-recorder-time]").textContent = "00:00";
    setError();
    setState("idle");
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !window.isSecureContext) {
      setState("unsupported");
      setError("Open this form in Safari or Chrome to record, or upload a recording from your device.");
      return;
    }
    revokeDraft();
    const attempt = ++token;
    setError();
    setState("requesting");
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}, video: false});
      if (attempt !== token || !modal.open || !input?.isConnected || input.disabled) {
        acquired.getTracks().forEach(track => track.stop());
        return;
      }
      stream = acquired;
      const candidates = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"];
      const mimeType = candidates.find(type => MediaRecorder.isTypeSupported?.(type));
      const options = {audioBitsPerSecond: 64000};
      if (mimeType) options.mimeType = mimeType;
      recorder = new MediaRecorder(stream, options);
      chunks = []; bytes = 0; elapsed = 0; discardTake = false; captureError = "";
      const take = recorder;
      take.addEventListener("dataavailable", event => {
        if (!event.data?.size) return;
        chunks.push(event.data);
        bytes += event.data.size;
        if (bytes >= LIMIT && ["recording", "paused"].includes(state)) stopRecording();
      });
      take.addEventListener("error", () => {
        captureError = "The microphone was interrupted. Please record again or upload an audio file.";
        if (["recording", "paused"].includes(state)) stopRecording();
      });
      take.addEventListener("stop", () => {
        if (attempt !== token) return;
        clearInterval(timer);
        releaseStream();
        if (discardTake || !input?.isConnected) return;
        if (captureError) { setState("idle"); setError(captureError); return; }
        const blob = new Blob(chunks, {type: take.mimeType || chunks[0]?.type || "audio/webm"});
        chunks = [];
        if (!blob.size || blob.size > LIMIT) {
          setState("idle");
          setError(blob.size ? "The audio exceeds 12 MB. Please make a shorter recording." : "No audio was captured. Please check your microphone and try again.");
          return;
        }
        const baseType = blob.type.split(";")[0];
        const extension = baseType.includes("mp4") ? "m4a" : baseType.includes("ogg") ? "ogg" : "webm";
        file = new File([blob], `qaj-recitation-aal-e-imran.${extension}`, {type: baseType, lastModified: Date.now()});
        draftUrl = URL.createObjectURL(file);
        modal.querySelector("[data-recorder-player]").src = draftUrl;
        const download = modal.querySelector("[data-recorder-download]");
        download.href = draftUrl;
        download.download = file.name;
        setState("review");
      });
      stream.getAudioTracks().forEach(track => track.addEventListener("ended", () => {
        if (take === recorder && ["recording", "paused"].includes(state)) stopRecording();
      }));
      take.start(1000);
      setState("recording");
      startedAt = performance.now();
      timer = setInterval(updateTime, 250);
      updateTime();
    } catch (error) {
      if (attempt !== token) return;
      releaseStream();
      setState("idle");
      const messages = {
        NotAllowedError: "Microphone access was blocked. Allow the microphone in this browser’s site settings, then try again. You can also upload an audio file.",
        PermissionDeniedError: "Allow microphone access in your browser’s site settings, then try again.",
        NotFoundError: "No microphone was found. Connect a microphone or upload an audio file.",
        NotReadableError: "Your microphone is being used elsewhere. Close the other app and try again, or upload a recording."
      };
      setError(messages[error.name] || "Recording could not start on this browser. Try Safari or Chrome, or upload an audio file.");
    }
  }

  function pauseOrResume() {
    try {
      if (state === "recording") {
        recorder.pause();
        elapsed += (performance.now() - startedAt) / 1000;
        setState("paused");
      } else if (state === "paused") {
        recorder.resume();
        startedAt = performance.now();
        setState("recording");
      }
      updateTime();
    } catch { setError("Pause is unavailable on this browser. Tap Stop to finish your recording."); }
  }

  function showAttached(control) {
    if (attachedUrl) URL.revokeObjectURL(attachedUrl);
    attachedUrl = "";
    const preview = control?.closest(".assessment-upload")?.querySelector("[data-audio-preview]");
    const selected = control?.files?.[0];
    if (!preview) return;
    const player = preview.querySelector("audio");
    player.pause();
    preview.hidden = !selected || !selected.type.startsWith("audio/") || selected.size > LIMIT;
    if (preview.hidden) { player.removeAttribute("src"); player.load(); return; }
    attachedUrl = URL.createObjectURL(selected);
    player.src = attachedUrl;
    preview.querySelector("[data-audio-detail]").textContent = `${selected.name} · ${selected.size < 1024 * 1024 ? Math.ceil(selected.size / 1024) + " KB" : (selected.size / (1024 * 1024)).toFixed(1) + " MB"}`;
  }

  function closeModal() {
    if (state === "requesting") { token += 1; setState("idle"); }
    if (["recording", "paused"].includes(state)) stopRecording();
    modal.querySelector("[data-recorder-player]").pause();
    if (modal.open) modal.close();
    returnFocus?.focus?.({preventScroll: true});
  }

  function attachRecording() {
    if (!file || !input?.isConnected || input.disabled) return;
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      if (input.files[0]?.size !== file.size) throw new Error("attachment-unavailable");
      input.setCustomValidity("");
      input.dispatchEvent(new Event("change", {bubbles: true}));
      closeModal();
      input.closest(".assessment-upload").querySelector("[data-audio-preview]")?.scrollIntoView({block: "center", behavior: "smooth"});
    } catch {
      setError("This browser cannot attach the audio automatically. Save the recording below, then choose ‘Upload an audio file’ to attach it.");
    }
  }

  function initialise() {
    form = document.querySelector("#registration-form");
    if (!form) return;
    modal = document.createElement("dialog");
    modal.className = "recorder-dialog";
    modal.setAttribute("aria-labelledby", "recorder-title");
    modal.setAttribute("aria-describedby", "recorder-instruction");
    modal.innerHTML = `<div class="recorder-frame"><header class="recorder-header"><div class="recorder-heading"><p class="eyebrow">QAJ · Recitation assessment</p><h2 id="recorder-title">Surah Aal-e-Imran</h2><p id="recorder-instruction">Recite Ayahs 1–5. Stop at the marker ⑤.</p></div><button type="button" class="recorder-close" data-recorder-close aria-label="Back to registration">×</button></header><div class="recorder-tools"><span>Scroll the page as you recite</span><div class="recorder-zoom" aria-label="Reading page size"><button type="button" data-recorder-zoom="-25" aria-label="Reduce reading page size" disabled>A−</button><button type="button" data-recorder-zoom="25" aria-label="Enlarge reading page size">A+</button></div></div><div class="recorder-reading" tabindex="0" role="region" aria-label="Quran reading reference"><img src="/assets/aal-e-imran-reference.jpg" alt="Reading reference for Surah Aal-e-Imran, Ayahs 1–5; the page also shows Ayah 6." width="914" height="1536"></div><footer class="recorder-footer"><div class="recorder-state-row"><span class="recorder-state"><i aria-hidden="true"></i><span data-recorder-status role="status" aria-live="polite"></span></span><span class="recorder-time" data-recorder-time role="timer" aria-label="Recorded time" aria-live="off">00:00</span></div><p class="recorder-error" data-recorder-error role="alert" hidden></p><div class="recorder-playback" data-recorder-playback hidden><audio data-recorder-player controls preload="metadata" aria-label="Listen to your recitation"></audio><a class="recorder-download" data-recorder-download>Save a copy of this recording</a></div><div class="recorder-actions"><button type="button" class="recorder-secondary" data-recorder-secondary hidden></button><button type="button" class="recorder-main" data-recorder-main></button></div><p class="recorder-note" data-recorder-note></p><button class="recorder-fallback" type="button" data-recorder-fallback>Upload an audio file instead</button></footer></div>`;
    document.body.append(modal);
    setState("idle");

    modal.querySelector("[data-recorder-main]").addEventListener("click", () => {
      if (state === "idle") startRecording();
      else if (["recording", "paused"].includes(state)) stopRecording();
      else if (state === "review") attachRecording();
    });
    modal.querySelector("[data-recorder-secondary]").addEventListener("click", () => {
      if (state === "review") { resetTake(); startRecording(); }
      else pauseOrResume();
    });
    modal.querySelector("[data-recorder-close]").addEventListener("click", closeModal);
    modal.addEventListener("cancel", event => { event.preventDefault(); closeModal(); });
    modal.querySelector("[data-recorder-fallback]").addEventListener("click", () => {
      closeModal();
      const details = input?.closest("details");
      if (details) details.open = true;
      input?.click();
    });
    modal.querySelectorAll("[data-recorder-zoom]").forEach(button => button.addEventListener("click", () => {
      zoom = Math.max(100,Math.min(175,zoom + Number(button.dataset.recorderZoom)));
      modal.querySelector(".recorder-reading").style.setProperty("--reading-width",`${zoom}%`);
      modal.querySelector('[data-recorder-zoom="-25"]').disabled = zoom === 100;
      modal.querySelector('[data-recorder-zoom="25"]').disabled = zoom === 175;
    }));
    modal.querySelector("img").addEventListener("error", () => setError("The reading page could not load. Please check your connection and reopen the recorder."));

    document.addEventListener("click", event => {
      const button = event.target.closest("[data-open-recorder]");
      if (!button) return;
      const currentInput = button.closest(".assessment-upload")?.querySelector('[name="test_me_audio"]');
      if (!currentInput || currentInput.disabled) return;
      if (input !== currentInput) resetTake();
      input = currentInput;
      returnFocus = button;
      const attachedPlayer = button.closest(".assessment-upload").querySelector("[data-audio-preview] audio");
      attachedPlayer?.pause();
      modal.showModal();
      modal.querySelector("[data-recorder-main]").focus({preventScroll: true});
    });

    form.addEventListener("change", event => {
      if (event.target.name === "test_me_audio") showAttached(event.target);
      if (event.target.name === "quran_reading_level" && event.target.value !== "join_and_read" && modal.open) closeModal();
    });
    form.addEventListener("invalid", event => {
      if (event.target.name === "test_me_audio") {
        const details = event.target.closest("details");
        if (details) details.open = true;
      }
    }, true);
    form.addEventListener("reset", () => {
      closeModal(); resetTake(); input = null;
      if (attachedUrl) URL.revokeObjectURL(attachedUrl);
      attachedUrl = "";
      form.querySelectorAll("[data-audio-preview]").forEach(panel => { panel.hidden = true; panel.querySelector("audio")?.pause(); });
    });
    new MutationObserver(() => {
      if (input && !input.isConnected) { closeModal(); resetTake(); input = null; if (attachedUrl) URL.revokeObjectURL(attachedUrl); attachedUrl = ""; }
    }).observe(form.querySelector("[data-course-questions]"), {childList: true, subtree: true});
    document.addEventListener("visibilitychange", () => { if (document.hidden && ["recording", "paused"].includes(state)) stopRecording(); });
    window.addEventListener("pagehide", () => { token += 1; releaseStream(); clearInterval(timer); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",initialise);
  else initialise();
})();
