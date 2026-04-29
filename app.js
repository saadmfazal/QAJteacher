let currentUser = null;
let teacherProfile = null;
let teacherTid = null;
let teacherStudents = [];
let teacherBatches = [];
let teacherBatchStudents = [];
let courses = [];
let levels = [];
let schedules = [];
let timeBlocks = [];
let messages = [];
let policies = [];
let currentView = "home";
let scheduleMonthDate = new Date();
let scheduleFilter = "all";
let timeFilter = "available";
let selectedEntrySession = null;
let selectedBatchAttendanceStudents = [];
let successCloseAction = null;

const REFERENCE_WEEK_START = "2026-01-04"; // Sunday reference week for recurring teacher time blocks

function cleanValue(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateDMY(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatTime(value) {
  if (!value) return "";
  const date = value.includes("T") ? new Date(value) : null;
  let hours;
  let minutes;
  if (date) {
    hours = date.getHours();
    minutes = date.getMinutes();
  } else {
    [hours, minutes] = String(value).slice(0, 5).split(":").map(Number);
  }
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}.${String(minutes).padStart(2, "0")} ${suffix}`;
}

function dayName(day) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][Number(day)] || "";
}

function shortDayName(day) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][Number(day)] || "";
}

function getMonthStartDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEndDate(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getMonthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function timeToMinutes(timeValue) {
  if (!timeValue) return 0;
  const [h, m] = String(timeValue).slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getReferenceDateForDay(dayOfWeek) {
  const base = new Date(`${REFERENCE_WEEK_START}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + Number(dayOfWeek));
  return base.toISOString().slice(0, 10);
}

function buildStartEndAt(dayOfWeek, startTime, durationMinutes) {
  const datePart = getReferenceDateForDay(dayOfWeek);
  const start = new Date(`${datePart}T${startTime}:00+05:30`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start_at: start.toISOString(), end_at: end.toISOString() };
}

function getCourse(courseId) {
  return courses.find((course) => course.id === courseId) || null;
}

function getLevel(levelId) {
  return levels.find((level) => level.id === levelId) || null;
}

function getStudent(sid) {
  return teacherStudents.find((row) => row.sid === sid) || teacherBatchStudents.find((row) => row.sid === sid) || null;
}

function getSessionTimeLabel(session) {
  return formatTime(session.scheduled_start_at);
}

function getSessionTitle(session) {
  const course = getCourse(session.course_id);
  const level = getLevel(session.course_level_id);
  if (session.batch_id) {
    const batch = teacherBatches.find((row) => row.id === session.batch_id);
    return `${batch ? batch.batch_code : "Batch"} · ${course ? course.code || course.name : ""}${level ? " · " + level.level_name : ""}`;
  }
  const student = getStudent(session.sid);
  return `${student ? student.full_name : session.sid || "Student"} · ${course ? course.code || course.name : ""}${level ? " · " + level.level_name : ""}`;
}

function getSessionStatusClass(session) {
  if (session.entry_state === "submitted" || session.status === "completed") return "done";
  if (session.scheduled_date > todayDate()) return "future";
  if (session.schedule_source === "rescheduled") return "rescheduled";
  return "pending";
}

function getSessionStatusLabel(session) {
  if (session.entry_state === "submitted" || session.status === "completed") return "Entry Done";
  if (session.scheduled_date > todayDate()) return "Upcoming";
  if (session.schedule_source === "rescheduled") return "Rescheduled";
  return "Pending Entry";
}

function setMessage(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = type ? `message ${type}` : "message";
}

function showSuccess(title, text, onClose = null) {
  successCloseAction = onClose;
  document.getElementById("successTitle").textContent = title;
  document.getElementById("successText").textContent = text;
  document.getElementById("successModal").classList.add("show");
}

function closeSuccessModal() {
  document.getElementById("successModal").classList.remove("show");
  if (typeof successCloseAction === "function") successCloseAction();
  successCloseAction = null;
}

async function init() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    currentUser = data.session.user;
    await enterApp();
  }
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("loginMessage", "Logging in...", "");

  const email = cleanValue(document.getElementById("loginEmail").value);
  const password = cleanValue(document.getElementById("loginPassword").value);

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage("loginMessage", error.message, "error");
    return;
  }

  currentUser = data.user;
  await enterApp();
});

async function enterApp() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  await loadTeacherContext();
  await loadAllPortalData();
  openView("home");
}

async function logoutTeacher() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

async function loadTeacherContext() {
  const profileResult = await supabaseClient
    .from("qaj_user_profiles")
    .select("user_id, role, tid, display_name, is_active")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (!profileResult.data || !profileResult.data.tid) {
    alert("No teacher profile is linked to this login. Ask QAJ admin to link your account to a teacher TID.");
    await logoutTeacher();
    return;
  }

  teacherTid = profileResult.data.tid;

  const teacherResult = await supabaseClient
    .from("qajp5_teacher_db")
    .select("*")
    .eq("tid", teacherTid)
    .maybeSingle();

  if (teacherResult.error) throw new Error(teacherResult.error.message);
  teacherProfile = teacherResult.data;

  document.getElementById("teacherMiniText").textContent = `${teacherTid} · ${teacherProfile?.name || profileResult.data.display_name || "Teacher"}`;
}

async function loadAllPortalData() {
  await Promise.all([
    loadCoursesAndLevels(),
    loadAssignmentsAndStudents(),
    loadBatchesAndStudents(),
    loadSchedules(),
    loadTimeBlocks(),
    loadMessages(),
    loadPolicies(),
  ]);
  renderAllViews();
}

async function loadCoursesAndLevels() {
  const [courseResult, levelResult] = await Promise.all([
    supabaseClient.from("qaj_courses").select("id, code, name, course_kind, eligibility_mode, is_active").order("code"),
    supabaseClient.from("qaj_course_levels").select("id, course_id, level_code, level_name, sort_order, is_active").order("sort_order"),
  ]);
  if (courseResult.error) throw new Error(courseResult.error.message);
  if (levelResult.error) throw new Error(levelResult.error.message);
  courses = courseResult.data || [];
  levels = levelResult.data || [];
}

async function loadAssignmentsAndStudents() {
  const assignmentResult = await supabaseClient
    .from("qaj_individual_class_assignments")
    .select("id, sid, course_id, course_level_id, teacher_tid, teacher_time_block_id, teacher_time_block_id_2, eligibility_role, status, joined_date, left_date, notes")
    .eq("teacher_tid", teacherTid)
    .eq("status", "active");

  if (assignmentResult.error) throw new Error(assignmentResult.error.message);
  const assignments = assignmentResult.data || [];
  const sids = [...new Set(assignments.map((row) => row.sid).filter(Boolean))];

  if (!sids.length) {
    teacherStudents = [];
    return;
  }

  const studentResult = await supabaseClient
    .from("qajp5_student_db")
    .select("sid, full_name, contact, whatsapp_number, email, dob, address, country_residence, in_class_status")
    .in("sid", sids);

  if (studentResult.error) throw new Error(studentResult.error.message);

  teacherStudents = assignments.map((assignment) => {
    const student = (studentResult.data || []).find((row) => row.sid === assignment.sid) || {};
    return { ...student, assignment };
  });
}

async function loadBatchesAndStudents() {
  const batchTeacherResult = await supabaseClient
    .from("qaj_batch_teachers")
    .select("id, batch_id, teacher_tid, role, eligibility_role, is_active")
    .eq("teacher_tid", teacherTid)
    .eq("is_active", true);

  if (batchTeacherResult.error) throw new Error(batchTeacherResult.error.message);
  const batchIds = [...new Set((batchTeacherResult.data || []).map((row) => row.batch_id).filter(Boolean))];

  if (!batchIds.length) {
    teacherBatches = [];
    teacherBatchStudents = [];
    return;
  }

  const [batchResult, batchStudentResult] = await Promise.all([
    supabaseClient.from("qaj_batches").select("id, batch_code, course_id, course_level_id, batch_status, is_active, notes").in("id", batchIds),
    supabaseClient.from("qaj_batch_students").select("id, batch_id, sid, is_active, joined_date, left_date, notes").in("batch_id", batchIds).eq("is_active", true),
  ]);

  if (batchResult.error) throw new Error(batchResult.error.message);
  if (batchStudentResult.error) throw new Error(batchStudentResult.error.message);

  teacherBatches = (batchResult.data || []).map((batch) => {
    const teacherLink = (batchTeacherResult.data || []).find((row) => row.batch_id === batch.id);
    return { ...batch, teacherLink };
  });

  const sids = [...new Set((batchStudentResult.data || []).map((row) => row.sid).filter(Boolean))];
  if (!sids.length) {
    teacherBatchStudents = [];
    return;
  }

  const studentsResult = await supabaseClient
    .from("qajp5_student_db")
    .select("sid, full_name, contact, whatsapp_number, email, dob, address, country_residence, in_class_status")
    .in("sid", sids);

  if (studentsResult.error) throw new Error(studentsResult.error.message);

  teacherBatchStudents = (batchStudentResult.data || []).map((link) => {
    const student = (studentsResult.data || []).find((row) => row.sid === link.sid) || {};
    const batch = teacherBatches.find((row) => row.id === link.batch_id);
    return { ...student, batchStudent: link, batch };
  });
}

async function loadSchedules() {
  const startDate = toDateInputValue(getMonthStartDate(scheduleMonthDate));
  const endDate = toDateInputValue(getMonthEndDate(scheduleMonthDate));

  const result = await supabaseClient
    .from("qaj_class_sessions")
    .select("*")
    .eq("teacher_tid", teacherTid)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_start_at", { ascending: true });

  if (result.error) throw new Error(result.error.message);
  schedules = result.data || [];
}

async function loadTimeBlocks() {
  const result = await supabaseClient
    .from("qaj_teacher_time_blocks")
    .select("*")
    .eq("teacher_tid", teacherTid)
    .order("day_of_week", { ascending: true })
    .order("block_start_time", { ascending: true });

  if (result.error) throw new Error(result.error.message);
  timeBlocks = result.data || [];
}

async function loadMessages() {
  const result = await supabaseClient
    .from("qaj_teacher_messages")
    .select("*")
    .eq("teacher_tid", teacherTid)
    .order("created_at", { ascending: false });

  if (result.error) {
    console.warn("Messages table not ready:", result.error.message);
    messages = [];
    return;
  }

  messages = result.data || [];
}

async function loadPolicies() {
  const result = await supabaseClient
    .from("qaj_policy_documents")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (result.error) {
    console.warn("Policy table not ready:", result.error.message);
    policies = [];
    return;
  }

  policies = result.data || [];
}

function renderAllViews() {
  renderHome();
  renderStudentsView();
  renderScheduleView();
  renderPastEntries();
  renderTimesView();
  renderMessagesView();
  renderPolicyView();
  renderProfileView();
}

function openView(view) {
  currentView = view;
  const titles = {
    home: "Dashboard", students: "Students", schedule: "Schedules", entries: "Past Entries",
    times: "My Times", messages: "Messages", policy: "Policy & SOP", profile: "Profile"
  };
  document.getElementById("headerTitle").textContent = titles[view] || "Teacher Portal";

  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active-view"));
  const target = document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`);
  if (target) target.classList.add("active-view");

  document.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("active"));
  const navId = ["home", "students", "schedule", "entries"].includes(view)
    ? `nav${view.charAt(0).toUpperCase() + view.slice(1)}`
    : "navMore";
  const nav = document.getElementById(navId);
  if (nav) nav.classList.add("active");
}

function openMoreMenu() { document.getElementById("moreMenu").classList.add("show"); }
function closeMoreMenu() { document.getElementById("moreMenu").classList.remove("show"); }

function renderHome() {
  const today = todayDate();
  const todaySessions = schedules.filter((s) => s.scheduled_date === today);
  const upcoming = schedules.filter((s) => s.scheduled_date >= today).sort((a,b) => new Date(a.scheduled_start_at) - new Date(b.scheduled_start_at))[0];
  const missed = schedules.filter((s) => s.scheduled_date < today && s.entry_state !== "submitted" && s.status !== "completed" && !(s.was_rescheduled && s.rescheduled_to_session_id));

  document.getElementById("todayCount").textContent = todaySessions.length;
  document.getElementById("missedCount").textContent = missed.length;
  document.getElementById("studentCount").textContent = teacherStudents.length + teacherBatchStudents.length;
  document.getElementById("batchCount").textContent = teacherBatches.length;

  if (upcoming) {
    document.getElementById("nextClassTitle").textContent = getSessionTitle(upcoming);
    document.getElementById("nextClassMeta").textContent = `${formatDateDMY(upcoming.scheduled_date)} · ${getSessionTimeLabel(upcoming)} · ${getSessionStatusLabel(upcoming)}`;
  } else {
    document.getElementById("nextClassTitle").textContent = "No upcoming class";
    document.getElementById("nextClassMeta").textContent = "Your next scheduled class will appear here.";
  }

  const list = document.getElementById("todayClassesList");
  if (!todaySessions.length) {
    list.innerHTML = `<p class="empty">No classes scheduled for today.</p>`;
  } else {
    list.innerHTML = todaySessions.map(renderScheduleCard).join("");
  }

  const latestAnnouncement = messages.find((m) => m.message_type === "announcement") || null;
  document.getElementById("qajAnnouncement").innerHTML = latestAnnouncement
    ? `<div class="item-card"><strong>${escapeHtml(latestAnnouncement.subject || "Announcement")}</strong><p class="muted">${escapeHtml(latestAnnouncement.body || "")}</p></div>`
    : `<div class="item-card"><strong>Welcome to the Teacher Portal</strong><p class="muted">QAJ announcements will appear here after admin publishes them.</p></div>`;
}

function renderStudentsView() {
  const query = cleanValue(document.getElementById("studentSearch")?.value || "")?.toLowerCase() || "";
  const rows = [
    ...teacherStudents.map((student) => ({ type: "individual", student })),
    ...teacherBatchStudents.map((student) => ({ type: "group", student })),
  ].filter(({ student }) => {
    const batch = student.batch;
    const assignment = student.assignment;
    const course = getCourse(assignment?.course_id || batch?.course_id);
    const text = `${student.sid || ""} ${student.full_name || ""} ${course?.code || ""} ${course?.name || ""} ${batch?.batch_code || ""}`.toLowerCase();
    return !query || text.includes(query);
  });

  const target = document.getElementById("studentsList");
  if (!rows.length) {
    target.innerHTML = `<p class="empty">No assigned students found.</p>`;
    return;
  }

  target.innerHTML = rows.map(({ type, student }) => {
    const batch = student.batch;
    const assignment = student.assignment;
    const course = getCourse(assignment?.course_id || batch?.course_id);
    const level = getLevel(assignment?.course_level_id || batch?.course_level_id);
    return `
      <article class="item-card clickable" onclick="openStudentDetails('${escapeHtml(student.sid)}')">
        <div class="item-top">
          <strong>${escapeHtml(student.sid)} · ${escapeHtml(student.full_name)}</strong>
          <span class="pill ${type === "individual" ? "blue" : "yellow"}">${type === "individual" ? "Individual" : "Group"}</span>
        </div>
        <div class="item-meta">
          <span>${escapeHtml(course ? course.name : "")}</span>
          ${level ? `<span>· ${escapeHtml(level.level_name)}</span>` : ""}
          ${batch ? `<span>· ${escapeHtml(batch.batch_code)}</span>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function renderScheduleCard(session) {
  const statusClass = getSessionStatusClass(session);
  const type = session.batch_id ? "Group" : "Individual";
  return `
    <article class="item-card schedule-card ${statusClass} clickable" onclick="openEntryModal('${escapeHtml(session.id)}')">
      <div class="item-top">
        <strong>${escapeHtml(getSessionTitle(session))}</strong>
        <span class="pill ${statusClass === "done" ? "green" : statusClass === "pending" ? "yellow" : statusClass === "rescheduled" ? "red" : "gray"}">${escapeHtml(getSessionStatusLabel(session))}</span>
      </div>
      <div class="item-meta">
        <span>${escapeHtml(formatDateDMY(session.scheduled_date))}</span>
        <span>· ${escapeHtml(getSessionTimeLabel(session))}</span>
        <span>· ${type}</span>
      </div>
      ${session.entry_notes ? `<p class="muted">${escapeHtml(session.entry_notes)}</p>` : ""}
    </article>
  `;
}

function setScheduleFilter(filter) {
  scheduleFilter = filter;
  document.querySelectorAll("[id^='scheduleFilter']").forEach((el) => el.classList.remove("active"));
  const id = `scheduleFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
  const btn = document.getElementById(id);
  if (btn) btn.classList.add("active");
  renderScheduleView();
}

async function changeScheduleMonth(direction) {
  scheduleMonthDate = new Date(scheduleMonthDate.getFullYear(), scheduleMonthDate.getMonth() + direction, 1);
  await loadSchedules();
  renderHome();
  renderScheduleView();
  renderPastEntries();
}

function renderScheduleView() {
  document.getElementById("scheduleMonthLabel").textContent = getMonthLabel(scheduleMonthDate);
  let rows = [...schedules];
  if (scheduleFilter === "pending") rows = rows.filter((s) => s.scheduled_date <= todayDate() && s.entry_state !== "submitted" && s.status !== "completed");
  if (scheduleFilter === "done") rows = rows.filter((s) => s.entry_state === "submitted" || s.status === "completed");
  if (scheduleFilter === "individual") rows = rows.filter((s) => !s.batch_id);
  if (scheduleFilter === "group") rows = rows.filter((s) => !!s.batch_id);

  const target = document.getElementById("scheduleList");
  if (!rows.length) {
    target.innerHTML = `<p class="empty">No schedules found for this filter.</p>`;
    return;
  }
  target.innerHTML = rows.map(renderScheduleCard).join("");
}

function renderPastEntries() {
  const query = cleanValue(document.getElementById("entrySearch")?.value || "")?.toLowerCase() || "";
  let rows = schedules.filter((s) => s.entry_state === "submitted" || s.status === "completed");
  rows = rows.filter((s) => {
    const text = `${getSessionTitle(s)} ${s.entry_notes || ""} ${s.class_title || ""}`.toLowerCase();
    return !query || text.includes(query);
  });

  const target = document.getElementById("pastEntriesList");
  if (!rows.length) {
    target.innerHTML = `<p class="empty">No past entries found for this month.</p>`;
    return;
  }
  target.innerHTML = rows.map(renderScheduleCard).join("");
}

function openEntryModal(sessionId) {
  selectedEntrySession = schedules.find((s) => s.id === sessionId);
  if (!selectedEntrySession) return;

  document.getElementById("entryModalTitle").textContent = getSessionTitle(selectedEntrySession);
  document.getElementById("entryModalSub").textContent = `${formatDateDMY(selectedEntrySession.scheduled_date)} · ${getSessionTimeLabel(selectedEntrySession)} · ${getSessionStatusLabel(selectedEntrySession)}`;

  if (selectedEntrySession.batch_id) renderBatchEntryForm();
  else renderIndividualEntryForm();

  document.getElementById("entryModal").classList.add("show");
}

function closeEntryModal() { document.getElementById("entryModal").classList.remove("show"); }

function canSubmitSession(session) {
  if (!session) return false;
  if (session.scheduled_date > todayDate()) return false;
  if (session.was_rescheduled && session.rescheduled_to_session_id) return false;
  if (session.status === "cancelled") return false;
  return true;
}

function renderIndividualEntryForm() {
  const s = selectedEntrySession;
  const canSubmit = canSubmitSession(s);
  document.getElementById("entryModalContent").innerHTML = `
    <form id="individualEntryForm" class="form-grid">
      ${!canSubmit ? `<div></div><p class="message error">This class cannot receive entries now.</p>` : ""}
      <label>Student Arrival</label>
      <select id="individualStudentArrival" ${!canSubmit ? "disabled" : ""}>
        <option value="on_time" ${s.student_arrival_status === "on_time" ? "selected" : ""}>On Time</option>
        <option value="late" ${s.student_arrival_status === "late" ? "selected" : ""}>Late</option>
        <option value="absent" ${s.student_arrival_status === "absent" ? "selected" : ""}>Absent</option>
      </select>
      <label>Teacher Arrival</label>
      <select id="individualTeacherArrival" ${!canSubmit ? "disabled" : ""}>
        <option value="on_time" ${s.teacher_arrival_status === "on_time" ? "selected" : ""}>On Time</option>
        <option value="late" ${s.teacher_arrival_status === "late" ? "selected" : ""}>Late</option>
      </select>
      <label>Class Notes</label>
      <textarea id="individualNotes" ${!canSubmit ? "disabled" : ""}>${escapeHtml(s.entry_notes || "")}</textarea>
      <label>Ready for Exam</label>
      <select id="individualExam" ${!canSubmit ? "disabled" : ""}>
        <option value="false" ${!s.exam_enabled ? "selected" : ""}>No</option>
        <option value="true" ${s.exam_enabled ? "selected" : ""}>Yes</option>
      </select>
      <label>Exam Notes</label>
      <textarea id="individualExamNotes" ${!canSubmit ? "disabled" : ""}>${escapeHtml(s.exam_enabled_notes || "")}</textarea>
      <label>Notify Head Teacher</label>
      <select id="individualNotify" ${!canSubmit ? "disabled" : ""}>
        <option value="false" ${!s.notify_head_teacher ? "selected" : ""}>No</option>
        <option value="true" ${s.notify_head_teacher ? "selected" : ""}>Yes</option>
      </select>
      <label>Notify Reason</label>
      <textarea id="individualNotifyReason" ${!canSubmit ? "disabled" : ""}>${escapeHtml(s.notify_head_teacher_reason || "")}</textarea>
      <button class="primary-btn full" type="submit" ${!canSubmit ? "disabled" : ""}>Submit Entry</button>
      <p id="entryMessage" class="message"></p>
    </form>
  `;
  document.getElementById("individualEntryForm").addEventListener("submit", submitIndividualEntry);
}

async function renderBatchEntryForm() {
  const s = selectedEntrySession;
  const canSubmit = canSubmitSession(s);
  const batchLinks = teacherBatchStudents.filter((row) => row.batch?.id === s.batch_id);
  selectedBatchAttendanceStudents = batchLinks;

  document.getElementById("entryModalContent").innerHTML = `
    <form id="batchEntryForm" class="entry-form-section">
      ${!canSubmit ? `<p class="message error">This class cannot receive entries now.</p>` : ""}
      <div class="form-grid">
        <label>Class Title</label>
        <input id="batchClassTitle" value="${escapeHtml(s.class_title || "")}" ${!canSubmit ? "disabled" : ""} required />
        <label>Class Notes</label>
        <textarea id="batchNotes" ${!canSubmit ? "disabled" : ""}>${escapeHtml(s.entry_notes || "")}</textarea>
        <label>Recording Title</label>
        <input id="batchRecordingTitle" value="${escapeHtml(s.recording_title || "")}" ${!canSubmit ? "disabled" : ""} />
        <label>Recording Link</label>
        <input id="batchRecordingLink" value="${escapeHtml(s.recording_link || "")}" ${!canSubmit ? "disabled" : ""} />
        <label>Notify Head Teacher</label>
        <select id="batchNotify" ${!canSubmit ? "disabled" : ""}>
          <option value="false" ${!s.notify_head_teacher ? "selected" : ""}>No</option>
          <option value="true" ${s.notify_head_teacher ? "selected" : ""}>Yes</option>
        </select>
        <label>Notify Reason</label>
        <textarea id="batchNotifyReason" ${!canSubmit ? "disabled" : ""}>${escapeHtml(s.notify_head_teacher_reason || "")}</textarea>
      </div>
      <h3>Attendance</h3>
      ${batchLinks.map((student) => `
        <div class="attendance-row" data-sid="${escapeHtml(student.sid)}">
          <div class="attendance-row-top"><strong>${escapeHtml(student.sid)} · ${escapeHtml(student.full_name)}</strong></div>
          <select class="attendance-status" ${!canSubmit ? "disabled" : ""}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
          <input class="attendance-notes" placeholder="Notes" ${!canSubmit ? "disabled" : ""} />
        </div>
      `).join("")}
      <button class="primary-btn full" type="submit" ${!canSubmit ? "disabled" : ""}>Submit Batch Entry</button>
      <p id="entryMessage" class="message"></p>
    </form>
  `;
  document.getElementById("batchEntryForm").addEventListener("submit", submitBatchEntry);
}

async function submitIndividualEntry(event) {
  event.preventDefault();
  const studentArrival = cleanValue(document.getElementById("individualStudentArrival").value);
  const teacherArrival = cleanValue(document.getElementById("individualTeacherArrival").value);
  const notes = cleanValue(document.getElementById("individualNotes").value);
  const examEnabled = document.getElementById("individualExam").value === "true";
  const examNotes = cleanValue(document.getElementById("individualExamNotes").value);
  const notify = document.getElementById("individualNotify").value === "true";
  const notifyReason = cleanValue(document.getElementById("individualNotifyReason").value);

  if (notify && !notifyReason) return setMessage("entryMessage", "Reason is required when notifying head teacher.", "error");
  if (examEnabled && !examNotes) return setMessage("entryMessage", "Exam notes are required when ready for exam is selected.", "error");

  const entryOutcome = studentArrival === "absent" ? "absent_student" : "present";
  const attendance = studentArrival === "absent" ? "absent" : studentArrival === "late" ? "late" : "present";

  setMessage("entryMessage", "Submitting...", "");
  const { error } = await supabaseClient.rpc("qaj_submit_class_entry", {
    p_session_id: selectedEntrySession.id,
    p_entry_type: "individual",
    p_entry_outcome: entryOutcome,
    p_attendance: attendance,
    p_teacher_arrival_status: teacherArrival,
    p_student_arrival_status: studentArrival,
    p_class_title: null,
    p_entry_notes: notes,
    p_exam_enabled: examEnabled,
    p_exam_enabled_notes: examNotes,
    p_notify_head_teacher: notify,
    p_notify_head_teacher_reason: notifyReason,
    p_recording_title: null,
    p_recording_link: null,
    p_student_attendance: [],
    p_resources: [],
  });

  if (error) return setMessage("entryMessage", error.message, "error");
  await loadSchedules();
  renderAllViews();
  showSuccess("Entry Submitted", "Your individual class entry was submitted successfully.", closeEntryModal);
}

async function submitBatchEntry(event) {
  event.preventDefault();
  const classTitle = cleanValue(document.getElementById("batchClassTitle").value);
  const notes = cleanValue(document.getElementById("batchNotes").value);
  const recordingTitle = cleanValue(document.getElementById("batchRecordingTitle").value);
  const recordingLink = cleanValue(document.getElementById("batchRecordingLink").value);
  const notify = document.getElementById("batchNotify").value === "true";
  const notifyReason = cleanValue(document.getElementById("batchNotifyReason").value);

  if (!classTitle) return setMessage("entryMessage", "Class title is required.", "error");
  if (notify && !notifyReason) return setMessage("entryMessage", "Reason is required when notifying head teacher.", "error");

  const attendance = Array.from(document.querySelectorAll(".attendance-row")).map((row) => ({
    sid: row.dataset.sid,
    attendance_status: row.querySelector(".attendance-status").value,
    notes: cleanValue(row.querySelector(".attendance-notes").value),
  }));

  setMessage("entryMessage", "Submitting...", "");
  const { error } = await supabaseClient.rpc("qaj_submit_class_entry", {
    p_session_id: selectedEntrySession.id,
    p_entry_type: "batch",
    p_entry_outcome: "present",
    p_attendance: null,
    p_teacher_arrival_status: null,
    p_student_arrival_status: null,
    p_class_title: classTitle,
    p_entry_notes: notes,
    p_exam_enabled: false,
    p_exam_enabled_notes: null,
    p_notify_head_teacher: notify,
    p_notify_head_teacher_reason: notifyReason,
    p_recording_title: recordingTitle,
    p_recording_link: recordingLink,
    p_student_attendance: attendance,
    p_resources: [],
  });

  if (error) return setMessage("entryMessage", error.message, "error");
  await loadSchedules();
  renderAllViews();
  showSuccess("Batch Entry Submitted", "Your batch class entry was submitted successfully.", closeEntryModal);
}

function openStudentDetails(sid) {
  const student = getStudent(sid);
  if (!student) return;
  document.getElementById("studentModalContent").innerHTML = `
    <div class="profile-grid">
      <div class="profile-box"><small>SID</small><strong>${escapeHtml(student.sid)}</strong></div>
      <div class="profile-box"><small>Name</small><strong>${escapeHtml(student.full_name)}</strong></div>
      <div class="profile-box"><small>WhatsApp</small><strong>${student.whatsapp_number ? `<a href="https://wa.me/${escapeHtml(String(student.whatsapp_number).replace(/\D/g, ""))}" target="_blank">${escapeHtml(student.whatsapp_number)}</a>` : "-"}</strong></div>
      <div class="profile-box"><small>Email</small><strong>${student.email ? `<a href="mailto:${escapeHtml(student.email)}">${escapeHtml(student.email)}</a>` : "-"}</strong></div>
      <div class="profile-box"><small>Status</small><strong>${escapeHtml(student.in_class_status || "-")}</strong></div>
      <div class="profile-box"><small>Country</small><strong>${escapeHtml(student.country_residence || "-")}</strong></div>
    </div>
  `;
  document.getElementById("studentModal").classList.add("show");
}
function closeStudentModal() { document.getElementById("studentModal").classList.remove("show"); }

function getBlockDay(block) {
  if (block.day_of_week !== null && block.day_of_week !== undefined) return Number(block.day_of_week);
  if (!block.start_at) return "";
  return new Date(block.start_at).getDay();
}
function getBlockTime(block) {
  if (block.block_start_time) return block.block_start_time;
  if (!block.start_at) return "";
  const date = new Date(block.start_at);
  return `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
}
function getBlockStatus(block) {
  if (block.is_active === false) return "inactive";
  if (block.sid || block.batch_id) return "utilized";
  return block.status || "available";
}
function setTimeFilter(filter) {
  timeFilter = filter;
  document.querySelectorAll("[id^='timeFilter']").forEach((el) => el.classList.remove("active"));
  const btn = document.getElementById(`timeFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
  if (btn) btn.classList.add("active");
  renderTimesView();
}
function renderTimesView() {
  let rows = [...timeBlocks];
  if (timeFilter !== "all") rows = rows.filter((b) => getBlockStatus(b) === timeFilter);
  rows.sort((a,b) => getBlockDay(a) - getBlockDay(b) || timeToMinutes(getBlockTime(a)) - timeToMinutes(getBlockTime(b)));
  const target = document.getElementById("timeBlocksList");
  if (!rows.length) return target.innerHTML = `<p class="empty">No time slots found.</p>`;
  target.innerHTML = rows.map((block) => {
    const status = getBlockStatus(block);
    return `
      <article class="time-card">
        <span class="pill ${status === "available" ? "green" : status === "utilized" ? "yellow" : "gray"}">${escapeHtml(status)}</span>
        <strong>${escapeHtml(formatTime(getBlockTime(block)))}</strong>
        <small>${escapeHtml(shortDayName(getBlockDay(block)))} · ${escapeHtml(block.duration_minutes || 30)} mins</small>
      </article>
    `;
  }).join("");
}
function openTimeModal() { document.getElementById("timeForm").reset(); document.getElementById("timeDuration").value = 60; setMessage("timeMessage", "", ""); document.getElementById("timeModal").classList.add("show"); }
function closeTimeModal() { document.getElementById("timeModal").classList.remove("show"); }

document.getElementById("timeForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const day = Number(document.getElementById("timeDay").value);
  const start = cleanValue(document.getElementById("timeStart").value);
  const duration = Number(document.getElementById("timeDuration").value || 60);
  const notes = cleanValue(document.getElementById("timeNotes").value);
  if (duration < 30 || duration % 30 !== 0) return setMessage("timeMessage", "Duration must be in 30-minute intervals.", "error");

  const startMinutes = timeToMinutes(start);
  const payloads = [];
  for (let i = 0; i < duration / 30; i++) {
    const slotStart = minutesToTime(startMinutes + i * 30);
    const { start_at, end_at } = buildStartEndAt(day, slotStart, 30);
    payloads.push({ teacher_tid: teacherTid, start_at, end_at, day_of_week: day, block_start_time: slotStart, duration_minutes: 30, sid: null, batch_id: null, source: "manual", is_active: true, status: "available", notes });
  }
  const { error } = await supabaseClient.from("qaj_teacher_time_blocks").insert(payloads);
  if (error) return setMessage("timeMessage", error.message, "error");
  await loadTimeBlocks();
  renderTimesView();
  showSuccess("Times Added", `${payloads.length} available time slot(s) created.`, closeTimeModal);
});

function renderMessagesView() {
  const target = document.getElementById("messagesList");
  const normalMessages = messages.filter((m) => m.message_type !== "announcement");
  if (!normalMessages.length) return target.innerHTML = `<p class="empty">No messages yet.</p>`;
  target.innerHTML = normalMessages.map((m) => `
    <article class="item-card">
      <div class="item-top"><strong>${escapeHtml(m.subject || "Message")}</strong><span class="pill gray">${escapeHtml(m.to_type || "QAJ")}</span></div>
      <p class="muted">${escapeHtml(m.body || "")}</p>
      <small class="muted">${escapeHtml(formatDateTime(m.created_at))}</small>
    </article>
  `).join("");
}
function openMessageModal() { document.getElementById("messageForm").reset(); setMessage("messageFormMessage", "", ""); document.getElementById("messageModal").classList.add("show"); }
function closeMessageModal() { document.getElementById("messageModal").classList.remove("show"); }

document.getElementById("messageForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const toType = cleanValue(document.getElementById("messageToType").value);
  const subject = cleanValue(document.getElementById("messageSubject").value);
  const body = cleanValue(document.getElementById("messageBody").value);
  const { error } = await supabaseClient.from("qaj_teacher_messages").insert([{ teacher_tid: teacherTid, from_user_id: currentUser.id, to_type: toType, message_type: "teacher_message", subject, body, status: "sent" }]);
  if (error) return setMessage("messageFormMessage", error.message, "error");
  await loadMessages();
  renderMessagesView();
  showSuccess("Message Sent", "Your message was sent successfully.", closeMessageModal);
});

function renderPolicyView() {
  const target = document.getElementById("policyContent");
  if (!policies.length) {
    target.innerHTML = `
      <h3>Teacher Conduct</h3>
      <p>Teachers are expected to attend classes on time, submit entries promptly, and notify QAJ when support is needed.</p>
      <h3>Class Entries</h3>
      <p>Submit class entries after each completed class. Mark attendance accurately and notify the head teacher when a student needs attention.</p>
      <h3>Reschedules</h3>
      <p>Reschedules should be handled according to QAJ admin instructions and must include a reason.</p>
      <h3>Communication</h3>
      <p>Use the message section to contact admin or head teachers regarding student progress, class issues, or support needs.</p>
    `;
    return;
  }
  target.innerHTML = policies.map((p) => `<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.body || "")}</p>`).join("");
}

function renderProfileView() {
  const t = teacherProfile || {};
  document.getElementById("profileContent").innerHTML = `
    <div class="profile-box"><small>TID</small><strong>${escapeHtml(t.tid || teacherTid)}</strong></div>
    <div class="profile-box"><small>Name</small><strong>${escapeHtml(t.name || "-")}</strong></div>
    <div class="profile-box"><small>Status</small><strong>${escapeHtml(t.status || "-")}</strong></div>
    <div class="profile-box"><small>Contact</small><strong>${escapeHtml(t.contact || "-")}</strong></div>
    <div class="profile-box"><small>Email</small><strong>${t.email ? `<a href="mailto:${escapeHtml(t.email)}">${escapeHtml(t.email)}</a>` : "-"}</strong></div>
    <div class="profile-box"><small>Locality</small><strong>${escapeHtml(t.locality || "-")}</strong></div>
    <div class="profile-box"><small>Country</small><strong>${escapeHtml(t.country || "-")}</strong></div>
    <div class="profile-box"><small>School</small><strong>${escapeHtml(t.school || "-")}</strong></div>
    <div class="profile-box"><small>Madrasa</small><strong>${escapeHtml(t.madrasa || "-")}</strong></div>
  `;
}

init().catch((error) => {
  console.error(error);
  alert(error.message || "Could not start teacher portal.");
});
