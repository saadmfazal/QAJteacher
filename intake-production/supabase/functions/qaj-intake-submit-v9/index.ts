import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const API_VERSION = "qaj-intake-submit-v9";
const BUCKET = "qaj-registration-files";
const MAX_IMAGE = 6 * 1024 * 1024;
const MAX_PDF = 2 * 1024 * 1024;
const MAX_AUDIO = 12 * 1024 * 1024;

const COURSE_MAP: Record<string, string> = {
  "thajweedh": "THAJ",
  "quranic-arabic-ladies": "QA",
  "quranic-arabic-teenagers": "QA",
  "quranic-arabic-adults": "QA",
  "quranic-words-young-hearts": "QAYH",
  "quranic-arabic-young-hearts-1": "QAYH",
  "quranic-arabic-young-hearts-2": "QAYH",
  "quranic-arabic-young-hearts-3": "QAYH",
  "basic-islamic-studies": "BIS",
  "intermediary-islamic-studies": "IIS",
  "quran-halqa": "HLQ",
  "quran-revert-sisters": "RVT"
};

const EXCLUDED_META = new Set([
  "course_code", "full_name", "dob", "address", "phone", "whatsapp", "instagram",
  "emergency_contact", "country_birth", "country_residency", "email", "class_mode",
  "class_location", "available_days", "time_from_12h", "time_to_12h", "registration_type",
  "relationship", "child_notes", "course_meta", "payment_receipt", "test_me_audio",
  "data_correct", "first_registration", "submission_id"
]);

type Metrics = { storage: number; db: number; total: number };
type FileKind = { ext: string; mime: string };

function allowedOrigin(origin: string) {
  if (!origin) return true;
  if (origin === "https://intake.quranarabicjournal.com") return true;
  if (origin === "https://qaj-intake-v9-vercel-drop.vercel.app") return true;
  if (origin === "https://qaj-intake-v9-mobile-fix.vercel.app") return true;
  return /^https:\/\/qaj-registration-brand-preview(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
}

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin) && origin ? origin : "https://intake.quranarabicjournal.com",
    "Access-Control-Allow-Headers": "content-type, accept",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}

function safeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function responsePage(title: string, message: string, ok: boolean) {
  const accent = ok ? "#096a65" : "#b42318";
  const symbol = ok ? "✓" : "!";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#3b132b"><meta name="robots" content="noindex"><title>${safeHtml(title)}</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;color:#25161f;background:#fff4df;font:16px/1.5 system-ui,-apple-system,sans-serif}.card{width:min(560px,100%);padding:28px;background:#fff;border:1px solid #e7d8ce;border-top:7px solid ${accent};border-radius:16px;box-shadow:0 18px 45px rgba(59,19,43,.12)}.mark{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;color:white;background:${accent};font-size:28px;font-weight:700}h1{margin:18px 0 8px;font:600 34px/1.05 Georgia,serif}p{margin:0 0 20px;color:#74666e}a{min-height:48px;display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;color:white;background:#3b132b;border-radius:6px;text-decoration:none;font-weight:700}</style></head><body><main class="card"><div class="mark">${symbol}</div><h1>${safeHtml(title)}</h1><p>${safeHtml(message)}</p><a href="https://intake.quranarabicjournal.com/">Back to QAJ registration</a></main></body></html>`;
}

function respond(req: Request, status: number, body: Record<string, unknown>, metrics: Metrics) {
  const timing = `storage;dur=${metrics.storage.toFixed(1)}, db;dur=${metrics.db.toFixed(1)}, total;dur=${metrics.total.toFixed(1)}`;
  const common = {
    ...cors(req),
    "Cache-Control": "no-store",
    "Server-Timing": timing,
    "X-QAJ-API-Version": API_VERSION,
    "X-Content-Type-Options": "nosniff"
  };
  const transport = new URL(req.url).searchParams.get("transport");
  if (transport === "page") {
    const ok = status >= 200 && status < 300 && body.ok === true;
    const title = ok ? "Registration received" : "Registration not completed";
    const message = ok
      ? "Jazakillahu khairan. QAJ has received your registration and payment receipt."
      : typeof body.error === "string" ? body.error : "We could not complete the registration. Please go back and try again.";
    return new Response(responsePage(title, message, ok), {
      status: ok ? 200 : Math.max(400, status),
      headers: { ...common, "Content-Type": "text/html; charset=utf-8" }
    });
  }
  return Response.json(body, { status, headers: common });
}

function text(fd: FormData, name: string, max = 4000) {
  const value = String(fd.get(name) || "").trim();
  return value.slice(0, max);
}

function isUuidV4(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isAtLeastFour(dob: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const birth = new Date(`${dob}T12:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  const cutoff = new Date(Date.UTC(now.getUTCFullYear() - 4, now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  return birth <= cutoff;
}

function bytesStart(bytes: Uint8Array, values: number[]) {
  return values.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

async function receiptKind(file: File): Promise<FileKind | null> {
  const bytes = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  if (ascii(bytes, 0, 5) === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  if (bytesStart(bytes, [0xff, 0xd8, 0xff])) return { ext: "jpg", mime: "image/jpeg" };
  if (bytesStart(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ext: "png", mime: "image/png" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (["GIF87a", "GIF89a"].includes(ascii(bytes, 0, 6))) return { ext: "gif", mime: "image/gif" };
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4).toLowerCase();
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) return { ext: "heic", mime: "image/heic" };
    if (["avif", "avis"].includes(brand)) return { ext: "avif", mime: "image/avif" };
  }
  return null;
}

async function audioKind(file: File): Promise<FileKind | null> {
  const bytes = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  if (ascii(bytes, 0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return { ext: "mp3", mime: "audio/mpeg" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WAVE") return { ext: "wav", mime: "audio/wav" };
  if (ascii(bytes, 0, 4) === "OggS") return { ext: "ogg", mime: "audio/ogg" };
  if (bytesStart(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return { ext: "webm", mime: "audio/webm" };
  if (ascii(bytes, 4, 4) === "ftyp") return { ext: "m4a", mime: "audio/mp4" };
  return null;
}

function buildMeta(fd: FormData) {
  const meta: Record<string, unknown> = {};
  let count = 0;
  for (const [key, value] of fd.entries()) {
    if (count >= 80 || EXCLUDED_META.has(key) || value instanceof File) continue;
    const raw = String(value).slice(0, 4000);
    if (Object.prototype.hasOwnProperty.call(meta, key)) {
      meta[key] = Array.isArray(meta[key]) ? [...(meta[key] as unknown[]), raw] : [meta[key], raw];
    } else meta[key] = raw;
    count += 1;
  }
  return meta;
}

function userAgentFamily(req: Request) {
  const supplied = req.headers.get("user-agent") || "";
  if (/Instagram/i.test(supplied)) return "instagram-in-app";
  if (/FBAN|FBAV/i.test(supplied)) return "facebook-in-app";
  if (/SamsungBrowser/i.test(supplied)) return "samsung-internet";
  if (/CriOS/i.test(supplied)) return "ios-chrome";
  if (/iPhone|iPad|iPod/i.test(supplied) && /Safari/i.test(supplied)) return "ios-safari";
  if (/Android/i.test(supplied) && /Chrome/i.test(supplied)) return "android-chrome";
  if (/Firefox/i.test(supplied)) return "firefox";
  if (/Chrome/i.test(supplied)) return "chrome";
  if (/Safari/i.test(supplied)) return "safari";
  return "other";
}

Deno.serve(async (req: Request) => {
  const started = performance.now();
  const metrics: Metrics = { storage: 0, db: 0, total: 0 };
  let submissionId = "unresolved";
  let stage = "request";

  const done = (status: number, body: Record<string, unknown>) => {
    metrics.total = performance.now() - started;
    console.log(JSON.stringify({
      event: "qaj_intake_submission",
      api_version: API_VERSION,
      submission_id: submissionId,
      stage,
      status,
      receipt_bytes: body.receipt_bytes || 0,
      receipt_mime: body.receipt_mime || "",
      client_optimised: body.client_optimised || false,
      browser_family: userAgentFamily(req),
      storage_ms: Math.round(metrics.storage),
      db_ms: Math.round(metrics.db),
      total_ms: Math.round(metrics.total)
    }));
    const publicBody = { ...body };
    delete publicBody.receipt_bytes;
    delete publicBody.receipt_mime;
    delete publicBody.client_optimised;
    return respond(req, status, publicBody, metrics);
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method === "GET") return done(200, { ok: true, version: API_VERSION });
  if (req.method !== "POST") return done(405, { ok: false, error: "Method not allowed." });

  try {
    const origin = req.headers.get("origin") || "";
    if (!allowedOrigin(origin)) return done(403, { ok: false, error: "This submission origin is not allowed." });

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) return done(400, { ok: false, error: "The registration format was not recognised." });

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return done(500, { ok: false, error: "Registration is temporarily unavailable. Please try again shortly." });
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    stage = "parse";
    const fd = await req.formData();
    const submittedId = text(fd, "submission_id", 64);
    submissionId = isUuidV4(submittedId) ? submittedId : crypto.randomUUID();
    const rawCourse = text(fd, "course_code", 100);
    const courseCode = COURSE_MAP[rawCourse];
    const fullName = text(fd, "full_name", 250);
    const dob = text(fd, "dob", 20);
    const address = text(fd, "address", 1500);
    const phone = text(fd, "phone", 80);
    const whatsapp = text(fd, "whatsapp", 80);
    const emergencyContact = text(fd, "emergency_contact", 80);
    const countryBirth = text(fd, "country_birth", 120);
    const countryResidency = text(fd, "country_residency", 120);
    const email = text(fd, "email", 320);
    const registrationType = text(fd, "registration_type", 20);
    const relationship = text(fd, "relationship", 160) || null;
    const dataCorrect = fd.has("data_correct");

    stage = "validate";
    if (!courseCode || !fullName || !dob || !address || !phone || !whatsapp || !emergencyContact || !countryBirth || !countryResidency || !email || !registrationType || !dataCorrect) {
      return done(400, { ok: false, error: "Please complete all required fields and confirmations." });
    }
    if (!isAtLeastFour(dob)) return done(400, { ok: false, error: "The student must be at least 4 years old." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return done(400, { ok: false, error: "Please enter a valid email address." });
    if (!["self", "child", "other"].includes(registrationType)) return done(400, { ok: false, error: "Please choose who is being registered." });
    if (registrationType === "other" && !relationship) return done(400, { ok: false, error: "Relationship to the learner is required." });

    const classMode = text(fd, "class_mode", 20) || null;
    if (classMode && !["online", "physical"].includes(classMode)) return done(400, { ok: false, error: "Please choose a valid class mode." });

    const payment = fd.get("payment_receipt");
    if (!(payment instanceof File) || payment.size === 0) return done(400, { ok: false, error: "Payment receipt is required." });
    const detectedReceipt = await receiptKind(payment);
    if (!detectedReceipt) return done(400, { ok: false, error: "The payment receipt must be a genuine image or PDF file." });
    if (detectedReceipt.mime === "application/pdf" && payment.size > MAX_PDF) {
      return done(413, { ok: false, error: "This PDF is too large for a reliable mobile upload. Please upload a screenshot/photo instead, or a PDF smaller than 2 MB." });
    }
    if (detectedReceipt.mime !== "application/pdf" && payment.size > MAX_IMAGE) {
      return done(413, { ok: false, error: "This receipt photo is too large. Please upload a screenshot or a smaller photo." });
    }

    const audio = fd.get("test_me_audio");
    const needsAudio = rawCourse === "thajweedh" && text(fd, "quran_reading_level", 40) === "test_me";
    if (needsAudio && (!(audio instanceof File) || audio.size === 0)) return done(400, { ok: false, error: "Please attach the recitation recording for the Test me option." });
    let detectedAudio: FileKind | null = null;
    if (audio instanceof File && audio.size > 0) {
      if (audio.size > MAX_AUDIO) return done(413, { ok: false, error: "Audio file must be 12 MB or smaller." });
      detectedAudio = await audioKind(audio);
      if (!detectedAudio) return done(400, { ok: false, error: "The recitation recording format is not supported." });
    }

    stage = "existing-check";
    const dbReadStart = performance.now();
    const { data: existing, error: existingError } = await supabase
      .from("qaj_course_registrations")
      .select("id,payment_receipt_path,test_me_audio_path")
      .eq("id", submissionId)
      .maybeSingle();
    metrics.db += performance.now() - dbReadStart;
    if (existingError) return done(500, { ok: false, error: "QAJ could not check this registration. Please try again." });
    if (existing?.payment_receipt_path && (!needsAudio || existing.test_me_audio_path)) {
      stage = "idempotent-success";
      return done(200, {
        ok: true,
        id: submissionId,
        duplicate_safe_retry: true,
        receipt_bytes: payment.size,
        receipt_mime: detectedReceipt.mime,
        client_optimised: text(fd, "receipt_optimised", 10) === "true"
      });
    }

    stage = "storage";
    let receiptPath = existing?.payment_receipt_path || null;
    let audioPath = existing?.test_me_audio_path || null;
    const storageStart = performance.now();
    if (!receiptPath) {
      const path = `registrations/${submissionId}/payment_receipt.${detectedReceipt.ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, payment, {
        upsert: true,
        contentType: detectedReceipt.mime,
        cacheControl: "0"
      });
      if (error) {
        metrics.storage += performance.now() - storageStart;
        return done(500, { ok: false, error: "The payment receipt did not finish uploading. Your retry is safe and will not create a duplicate registration." });
      }
      receiptPath = path;
    }

    if (audio instanceof File && audio.size > 0 && detectedAudio && !audioPath) {
      const path = `registrations/${submissionId}/test_me_audio.${detectedAudio.ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, audio, {
        upsert: true,
        contentType: detectedAudio.mime,
        cacheControl: "0"
      });
      if (error) {
        metrics.storage += performance.now() - storageStart;
        return done(500, { ok: false, error: "The recitation recording did not finish uploading. Your retry is safe." });
      }
      audioPath = path;
    }
    metrics.storage += performance.now() - storageStart;

    const instagram = text(fd, "instagram", 160) || null;
    const classLocation = text(fd, "class_location", 160) || null;
    const timeFrom = text(fd, "time_from_12h", 20) || null;
    const timeTo = text(fd, "time_to_12h", 20) || null;
    const availableDays = fd.getAll("available_days").map(value => String(value).slice(0, 20)).slice(0, 7);
    const childNotes = fd.getAll("child_notes").map(value => String(value).slice(0, 80)).slice(0, 20);
    const courseMeta = { ...buildMeta(fd), selected_course_id: rawCourse, submission_id: submissionId };
    const payload = {
      id: submissionId,
      course_code: courseCode,
      full_name: fullName,
      dob,
      address,
      phone,
      whatsapp,
      instagram,
      emergency_contact: emergencyContact,
      country_birth: countryBirth,
      country_residency: countryResidency,
      email,
      class_mode: classMode,
      class_location: classLocation,
      available_days: availableDays,
      time_from_12h: timeFrom,
      time_to_12h: timeTo,
      registration_type: registrationType,
      relationship,
      child_notes: childNotes,
      payment_receipt_path: receiptPath,
      test_me_audio_path: audioPath,
      data_correct: true,
      first_registration: fd.has("first_registration"),
      course_meta: courseMeta,
      source: "intake_2026_web",
      intake_status: "pending"
    };

    stage = "database";
    const dbWriteStart = performance.now();
    let row;
    let writeError;
    if (existing) {
      const result = await supabase
        .from("qaj_course_registrations")
        .update({ payment_receipt_path: receiptPath, test_me_audio_path: audioPath })
        .eq("id", submissionId)
        .select("id,payment_receipt_path,test_me_audio_path")
        .single();
      row = result.data;
      writeError = result.error;
    } else {
      const result = await supabase
        .from("qaj_course_registrations")
        .insert(payload)
        .select("id,payment_receipt_path,test_me_audio_path")
        .single();
      row = result.data;
      writeError = result.error;
      if (writeError?.code === "23505") {
        const retry = await supabase
          .from("qaj_course_registrations")
          .select("id,payment_receipt_path,test_me_audio_path")
          .eq("id", submissionId)
          .single();
        row = retry.data;
        writeError = retry.error;
      }
    }
    metrics.db += performance.now() - dbWriteStart;
    if (writeError || !row?.id || !row.payment_receipt_path) {
      return done(500, { ok: false, error: "QAJ could not finish saving the registration. Your retry is safe and will not create a duplicate." });
    }
    if (needsAudio && !row.test_me_audio_path) {
      return done(500, { ok: false, error: "QAJ could not finish saving the recitation recording. Your retry is safe." });
    }

    stage = "success";
    return done(200, {
      ok: true,
      id: row.id,
      receipt_bytes: payment.size,
      receipt_mime: detectedReceipt.mime,
      client_optimised: text(fd, "receipt_optimised", 10) === "true"
    });
  } catch (error) {
    metrics.total = performance.now() - started;
    console.error(JSON.stringify({
      event: "qaj_intake_error",
      api_version: API_VERSION,
      submission_id: submissionId,
      stage,
      error_name: error instanceof Error ? error.name : "unknown"
    }));
    return respond(req, 500, { ok: false, error: "Registration is temporarily unavailable. Your answers are still here; please try again." }, metrics);
  }
});
