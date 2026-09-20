"use strict";

const COURSE_GROUPS = [
  {
    name: "Young Hearts", theme: "coral", courses: [
      {id: "quranic-words-young-hearts", title: "Qur’anic Words for Young Hearts", audience: "Early Qur’an learners", level: "Beginner", format: "Once weekly · group", fee: "Online LKR 2,500 · physical from LKR 3,000", location: "Online or physical", description: "One Qur’anic word each class, opened through stories, crafts and the QAJ Young Hearts book.", learn: ["One Qur’anic word in every class", "Stories and guided discussion", "Crafts and hands-on learning", "A warm first relationship with Qur’anic meaning"]},
      {id: "quranic-arabic-young-hearts-1", title: "Qur’anic Arabic for Young Hearts — Level 1", audience: "Girls and young children; boys under 10", level: "Level 1 · Beginner", format: "Current batch confirmed by QAJ", fee: "Current fee confirmed by QAJ", location: "Online or physical batch", description: "Children meet the Arabic alphabet through Qur’anic words, sounds and meaning-rich examples.", learn: ["Recognise Arabic letters clearly", "Pronounce letter sounds with care", "Connect letters to simple Qur’anic words", "See Arabic as the language of the Qur’an"]},
      {id: "quranic-arabic-young-hearts-2", title: "Qur’anic Arabic for Young Hearts — Level 2", audience: "Young learners continuing after Level 1", level: "Level 2 · Beginner Plus", format: "Current batch confirmed by QAJ", fee: "Current fee confirmed by QAJ", location: "Online or physical batch", description: "Children build a Qur’anic word bank through nouns, stories, activities and meaning-based repetition.", learn: ["Recognise common Qur’anic nouns", "Understand their basic meanings", "Build memory through stories and activities", "Prepare for sentence foundations"]},
      {id: "quranic-arabic-young-hearts-3", title: "Qur’anic Arabic for Young Hearts — Level 3", audience: "Young learners continuing after Level 2", level: "Level 3 · Foundation Plus", format: "Current batch confirmed by QAJ", fee: "Current fee confirmed by QAJ", location: "Online or physical batch", description: "A deeper level connecting vocabulary, simple sentence patterns and short ayah meanings.", learn: ["Grow Qur’anic vocabulary", "Notice simple sentence patterns", "Connect words to short ayah meanings", "Prepare for mature Arabic pathways"]}
    ]
  },
  {
    name: "Recitation", theme: "saffron", courses: [
      {id: "thajweedh", title: "Thajweedh", audience: "Kids 4+, teens and ladies", level: "Assessment-led", format: "Twice weekly · 30 mins · 1-to-1", fee: "Kids/teens from LKR 2,500 · ladies from LKR 3,000", location: "Online", description: "A personalised one-to-one recitation path, beginning at the learner’s actual level and progressing without pressure.", learn: ["Thibyan Books 1 and 2 for letters and fluency", "Progress into Al-Baqarah recitation", "Thajweedh rules introduced gradually", "A personal syllabus after a short assessment"]}
    ]
  },
  {
    name: "Qur’anic Arabic", theme: "teal", courses: [
      {id: "quranic-arabic-ladies", title: "Qur’anic Arabic — Ladies Only", audience: "Busy sisters and working women", level: "Basic → Intermediate → Advanced", format: "Once weekly · 1 hour · group", fee: "Online LKR 2,500 · physical LKR 3,500", location: "Online or physical", description: "A relaxed route from Arabic grammar into translation, tafseer and reflection—with no homework or exams.", learn: ["Grammar applied to real Qur’anic ayahs", "Al-Fatihah and 40 Rabbana duas", "Selected ayahs with grammar and tafseer", "Al-Baqarah journaling at advanced level"]},
      {id: "quranic-arabic-teenagers", title: "Qur’anic Arabic for Teenagers", audience: "Teen girls", level: "Teen pathway", format: "Once weekly · 1 hour · group", fee: "Online LKR 2,500 · physical LKR 3,500", location: "Online or physical", description: "The full QAJ Arabic pathway shaped for teen girls, with real Qur’anic examples and room for reflection.", learn: ["Arabic grammar from the foundations", "Al-Fatihah and 40 Rabbana duas", "Selected ayahs with grammar and tafseer", "A mature, safe learning rhythm"]},
      {id: "quranic-arabic-adults", title: "Qur’anic Arabic for Adults", audience: "Adult sisters", level: "Adult pathway", format: "Once weekly · 1 hour · group", fee: "Online LKR 2,500 · physical LKR 3,500", location: "Online or physical", description: "A calm adult pathway into Qur’anic Arabic through grammar, translation, tafseer and reflection.", learn: ["Arabic grammar from the foundations", "Word-by-word Qur’anic understanding", "Selected ayahs and tafseer", "Al-Baqarah journaling at advanced level"]}
    ]
  },
  {
    name: "Islamic Studies & Halqa", theme: "berry", courses: [
      {id: "basic-islamic-studies", title: "Basic Islamic Studies", audience: "Kids and teens after Thajweedh", level: "One-year foundation", format: "Twice weekly · 1 hour · group", fee: "Sri Lanka LKR 3,000 · abroad LKR 5,000", location: "Online or physical", description: "A practical one-year journey into Islamic character, worship and daily life after Thajweedh.", learn: ["Daily duas, hadeeth and good manners", "Stories of the Prophets and Seerah", "Basic fiqh and the 99 Names of Allah", "An end-of-year appreciation gathering"]},
      {id: "intermediary-islamic-studies", title: "Intermediary Islamic Studies", audience: "Teen girls and ladies after foundations", level: "Intermediate", format: "Current batch confirmed by QAJ", fee: "Current fee confirmed by QAJ", location: "Current mode confirmed by QAJ", description: "A discussion-led continuation into belief, worship, adab, identity and reflective Islamic learning.", learn: ["Strengthen core beliefs and worship", "Connect Islamic manners to daily choices", "Explore selected Seerah and hadeeth themes", "Build confidence in living Islam clearly"]},
      {id: "quran-halqa", title: "Qur’an Halqa", audience: "Girls, teen girls and ladies", level: "Ongoing", format: "Current batch confirmed by QAJ", fee: "Current fee confirmed by QAJ", location: "Current mode confirmed by QAJ", description: "A guided Qur’an circle for recitation rhythm, reflection and companionship around the Book.", learn: ["Keep a consistent recitation routine", "Reflect on selected meanings gently", "Grow through Qur’an-centred companionship", "Connect learning with everyday life"]},
      {id: "quran-revert-sisters", title: "Qur’an for Revert Sisters", audience: "Revert sisters and beginners", level: "Beginner", format: "Current batch confirmed by QAJ", fee: "Current fee confirmed by QAJ", location: "Current online options confirmed by QAJ", description: "A soft, respectful beginning for recitation, essential meanings, worship foundations and belonging.", learn: ["Begin recitation gently", "Understand essential Qur’anic meanings", "Learn worship foundations without overwhelm", "Ask questions in a safe, respectful space"]}
    ]
  }
];

const COURSE_LOOKUP = new Map(COURSE_GROUPS.flatMap(group => group.courses.map(course => [course.id, {...course, group: group.name, theme: group.theme}])));

const PROGRAMMES = [
  {
    id: "thajweedh",
    name: "Thajweedh",
    theme: "saffron",
    glyph: "ت",
    audience: "Kids 4+, teens & ladies",
    number: "01",
    description: "Personal, assessment-led Qur’an recitation—one learner and one Muallimah at a time.",
    facts: ["Twice weekly", "30 minutes", "1-to-1 online"],
    points: ["Begin from letters, joined reading or an existing Thajweedh foundation", "Follow Thibyan Books 1 and 2 before progressing into Al-Baqarah", "Receive a personalised syllabus after QAJ reviews the learner’s level", "Upload a short recitation only when you choose ‘Test me’"],
    courseIds: ["thajweedh"]
  },
  {
    id: "quranic-arabic",
    name: "Qur’anic Arabic",
    theme: "teal",
    glyph: "ع",
    audience: "Ladies, teenagers & adults",
    number: "02",
    description: "From grammar to verses, tafseer and reflection—at a pace made for real life.",
    facts: ["Once weekly", "1 hour", "Online or physical"],
    points: ["Begin with Arabic grammar applied to real Qur’anic ayahs", "Move through Al-Fatihah, 40 Rabbana duas and selected ayahs", "Continue into advanced grammar and Al-Baqarah journaling", "Choose a ladies, teen-girl or adult pathway"],
    courseIds: ["quranic-arabic-ladies", "quranic-arabic-teenagers", "quranic-arabic-adults"]
  },
  {
    id: "islamic-studies",
    name: "Islamic Studies & Halqa",
    theme: "berry",
    glyph: "ه",
    audience: "Children, teens & sisters",
    number: "03",
    description: "Practical Islamic foundations, deeper study and Qur’an companionship for the next season of learning.",
    facts: ["Four distinct paths", "Foundation → ongoing", "Guided placement"],
    points: ["Basic Islamic Studies is a one-year path after Thajweedh", "Intermediary study continues into belief, worship, adab and identity", "Qur’an Halqa supports consistent recitation and reflection", "Revert sisters receive a gentle, foundation-first beginning"],
    courseIds: ["basic-islamic-studies", "intermediary-islamic-studies", "quran-halqa", "quran-revert-sisters"]
  },
  {
    id: "young-hearts",
    name: "Qur’anic Words for Young Hearts",
    theme: "coral",
    glyph: "ق",
    audience: "Children and families",
    number: "04",
    description: "One word, one story, one activity—so Qur’anic Arabic begins with wonder.",
    facts: ["Ages 4+", "Group or family", "Online or physical"],
    points: ["Begin with one Qur’anic word per class through stories and crafts", "Continue through three progressive Arabic levels", "Choose a kids’ group or a family learning session", "Boys are welcome under the age of 10"],
    courseIds: ["quranic-words-young-hearts", "quranic-arabic-young-hearts-1", "quranic-arabic-young-hearts-2", "quranic-arabic-young-hearts-3"]
  }
];

const PROGRAMME_LOOKUP = new Map(PROGRAMMES.map(programme => [programme.id, programme]));
const THEME_COLORS = {saffron: "#d99b20", teal: "#198d86", berry: "#7b315a", coral: "#cc5d50"};

const AUDIENCE_GUIDES = {
  child: {programmes: ["young-hearts", "thajweedh", "islamic-studies"], copy: "Suggested for a child: Young Hearts, Thajweedh, or Islamic Studies after completing recitation foundations."},
  teen: {programmes: ["thajweedh", "quranic-arabic", "islamic-studies"], copy: "Suggested for a teen: Thajweedh, Qur’anic Arabic for Teenagers, or Islamic Studies and Halqa."},
  self: {programmes: ["quranic-arabic", "thajweedh", "islamic-studies"], copy: "Suggested for yourself: Qur’anic Arabic, ladies’ Thajweedh, Halqa, or continued Islamic study."},
  revert: {programmes: ["islamic-studies", "thajweedh"], copy: "Suggested for a new Muslim: Qur’an for Revert Sisters or an assessment-led Thajweedh path."},
  family: {programmes: ["young-hearts", "quranic-arabic", "thajweedh"], copy: "Suggested for a family: Young Hearts for shared learning, with Arabic or Thajweedh for individual levels."}
};

const YOUNG_HEARTS = new Set([
  "quranic-words-young-hearts",
  "quranic-arabic-young-hearts-1",
  "quranic-arabic-young-hearts-2",
  "quranic-arabic-young-hearts-3"
]);
const QA_ARABIC = new Set(["quranic-arabic-ladies", "quranic-arabic-teenagers", "quranic-arabic-adults"]);

const COUNTRIES = "Sri Lanka|Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo, Democratic Republic of the|Congo, Republic of the|Costa Rica|Côte d’Ivoire|Croatia|Cuba|Cyprus|Czechia|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|Sao Tome and Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Türkiye|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe|Other".split("|");

const form = document.querySelector("#registration-form");
const steps = [...document.querySelectorAll("[data-step]")];
const statusBox = document.querySelector("[data-form-status]");
const questionHost = document.querySelector("[data-course-questions]");
const programmeGrid = document.querySelector("[data-programme-grid]");
const dialog = document.querySelector("[data-intake-dialog]");
const infoPanel = document.querySelector("[data-course-info]");
const successPanel = document.querySelector("[data-success]");
const courseOptionsHost = document.querySelector("[data-course-options]");
const selectionBar = document.querySelector("[data-selection-bar]");
const selectedCourse = document.querySelector("[data-selected-course]");
const formMain = document.querySelector(".form-main");
const railCourse = document.querySelector("[data-rail-course]");
const railGlyph = document.querySelector("[data-rail-glyph]");
const railStep = document.querySelector("[data-rail-step]");
const railCopy = document.querySelector("[data-rail-copy]");
let currentStep = 0;
let activeProgramme = null;

function escapeMarkup(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;"})[char]);
}

function renderProgrammeCards() {
  programmeGrid.innerHTML = PROGRAMMES.map(programme => `
    <article class="programme-door" data-programme="${programme.id}" data-theme="${programme.theme}" data-glyph="${programme.glyph}">
      <span class="recommend-badge">Suggested</span>
      <div class="door-top"><span class="door-no">${programme.number}</span><span class="door-audience">${escapeMarkup(programme.audience)}</span></div>
      <div class="door-copy"><h3>${escapeMarkup(programme.name)}</h3><p>${escapeMarkup(programme.description)}</p><div class="door-facts">${programme.facts.map(fact => `<span>${escapeMarkup(fact)}</span>`).join("")}</div></div>
      <div class="door-actions">
        <button class="text-button" type="button" data-more-info="${programme.id}">More info</button>
        <button class="card-register" type="button" data-register="${programme.id}">Register now <span aria-hidden="true">→</span></button>
      </div>
    </article>`).join("");
}

function renderCourseOptions(programme) {
  courseOptionsHost.innerHTML = programme.courseIds.map(courseId => {
    const course = COURSE_LOOKUP.get(courseId);
    return `<label class="course-choice" style="--accent:${THEME_COLORS[course.theme]}">
      <input type="radio" name="course_code" value="${course.id}" required>
      <span class="choice-check" aria-hidden="true"></span>
      <span><small>${escapeMarkup(course.level)}</small><strong>${escapeMarkup(course.title)}</strong><p>${escapeMarkup(course.description)}</p><em>${escapeMarkup(course.format)}</em></span>
    </label>`;
  }).join("");
  const first = courseOptionsHost.querySelector('[name="course_code"]');
  if (programme.courseIds.length === 1 && first) {
    first.checked = true;
    renderCourseQuestions(first.value);
  }
}

function openDialog() {
  if (!dialog.open) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  document.body.classList.add("dialog-open");
}

function closeDialog() {
  if (dialog.open && typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
  document.body.classList.remove("dialog-open");
}

function setDialogHeading(kicker, title) {
  document.querySelector("[data-dialog-kicker]").textContent = kicker;
  document.querySelector("[data-dialog-title]").textContent = title;
}

function showProgrammeInfo(programmeId) {
  const programme = PROGRAMME_LOOKUP.get(programmeId);
  if (!programme) return;
  activeProgramme = programme;
  form.hidden = true;
  successPanel.hidden = true;
  infoPanel.hidden = false;
  infoPanel.querySelector("[data-info-theme]").dataset.infoTheme = programme.theme;
  infoPanel.querySelector("[data-info-glyph]").textContent = programme.glyph;
  infoPanel.querySelector("[data-info-audience]").textContent = programme.audience;
  infoPanel.querySelector("[data-info-title]").textContent = programme.name;
  infoPanel.querySelector("[data-info-copy]").textContent = programme.description;
  infoPanel.querySelector("[data-info-facts]").innerHTML = programme.facts.map(fact => `<span>${escapeMarkup(fact)}</span>`).join("");
  infoPanel.querySelector("[data-info-points]").innerHTML = programme.points.map(point => `<p><span aria-hidden="true">✓</span>${escapeMarkup(point)}</p>`).join("");
  infoPanel.querySelector("[data-info-options]").innerHTML = programme.courseIds.map(id => {
    const course = COURSE_LOOKUP.get(id);
    return `<article class="info-option" style="--option-accent:${THEME_COLORS[course.theme]}"><div><small>${escapeMarkup(course.level)} · ${escapeMarkup(course.audience)}</small><strong>${escapeMarkup(course.title)}</strong><p>${escapeMarkup(course.description)}</p><em>${escapeMarkup(course.format)} · ${escapeMarkup(course.location)} · ${escapeMarkup(course.fee)}</em></div><button type="button" data-register-course="${course.id}">Choose this path →</button></article>`;
  }).join("");
  const broadRegister = infoPanel.querySelector("[data-register-from-info]");
  broadRegister.hidden = programme.courseIds.length > 1;
  broadRegister.innerHTML = `Begin ${escapeMarkup(programme.name)} <span aria-hidden="true">→</span>`;
  setDialogHeading("Programme information", programme.name);
  openDialog();
}

function resetRegistration() {
  form.reset();
  questionHost.replaceChildren();
  document.querySelectorAll("[data-file-name]").forEach(label => label.textContent = "Choose a clear image or PDF · maximum 6 MB");
  updateConditions();
  hideStatus();
}

function startRegistration(programmeId, {reset = true} = {}) {
  const programme = PROGRAMME_LOOKUP.get(programmeId);
  if (!programme) return;
  activeProgramme = programme;
  if (reset) resetRegistration();
  renderCourseOptions(programme);
  document.querySelector("[data-course-step-title]").textContent = programme.courseIds.length === 1 ? programme.name : `Choose your ${programme.name} path`;
  document.querySelector("[data-course-step-copy]").textContent = programme.courseIds.length === 1 ? "This path is selected. QAJ will use the next answers to confirm the learner’s level and timing." : "Select the closest pathway. The QAJ team can still confirm the final placement after reviewing the intake.";
  infoPanel.hidden = true;
  successPanel.hidden = true;
  form.hidden = false;
  showStep(0, {focus: false});
  updateSelectedCourse();
  setDialogHeading("Student registration", programme.name);
  openDialog();
}

function startRegistrationForCourse(courseId, {step = 0} = {}) {
  const course = COURSE_LOOKUP.get(courseId);
  const programme = PROGRAMMES.find(item => item.courseIds.includes(courseId));
  if (!course || !programme) return false;
  startRegistration(programme.id);
  const control = form.querySelector(`[name="course_code"][value="${courseId}"]`);
  if (!control) return false;
  control.checked = true;
  renderCourseQuestions(courseId);
  updateSelectedCourse();
  showStep(step, {focus: false});
  return true;
}

function populateCountries() {
  document.querySelectorAll("[data-country]").forEach(select => {
    select.insertAdjacentHTML("beforeend", COUNTRIES.map(country => `<option value="${escapeMarkup(country)}">${escapeMarkup(country)}</option>`).join(""));
  });
}

function radio(name, label, options, hint = "") {
  return `<fieldset class="question-block">
    <legend>${label} *</legend>${hint ? `<p class="hint">${hint}</p>` : ""}
    <div class="option-stack">${options.map(([value, text, disabled = false]) => `<label><input type="radio" name="${name}" value="${value}" ${disabled ? "disabled" : ""} required><span>${text}</span></label>`).join("")}</div>
  </fieldset>`;
}

function field(name, label, {type = "text", placeholder = "", hint = "", required = true, accept = "", showName = "", showValue = ""} = {}) {
  const conditionalClass = showName ? " conditional" : "";
  const conditionalAttrs = showName ? ` data-when-name="${showName}" data-when-value="${showValue}" hidden` : "";
  const attrs = `${required ? " data-required=\"true\"" : ""}${accept ? ` accept="${accept}"` : ""}`;
  const control = type === "textarea"
    ? `<textarea name="${name}" placeholder="${placeholder}"${attrs}></textarea>`
    : `<input name="${name}" type="${type}" placeholder="${placeholder}"${attrs}>`;
  return `<label class="field question-block${conditionalClass}"${conditionalAttrs}><span class="question-label">${label}${required ? " *" : ""}</span>${hint ? `<small>${hint}</small>` : ""}${control}${type === "file" ? `<small data-dynamic-file>Choose a file</small>` : ""}</label>`;
}

function selectField(name, label, options, {required = true, showName = "", showValue = ""} = {}) {
  const conditionalClass = showName ? " conditional" : "";
  const conditionalAttrs = showName ? ` data-when-name="${showName}" data-when-value="${showValue}" hidden` : "";
  return `<label class="field question-block${conditionalClass}"${conditionalAttrs}><span class="question-label">${label}${required ? " *" : ""}</span><select name="${name}"${required ? " data-required=\"true\"" : ""}><option value="">Select an answer</option>${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}</select></label>`;
}

function checkGroup(name, label, options, {required = false, className = "check-grid", showName = "", showValue = ""} = {}) {
  const conditionalClass = showName ? " conditional" : "";
  const conditionalAttrs = showName ? ` data-when-name="${showName}" data-when-value="${showValue}" hidden` : "";
  return `<fieldset class="question-block${conditionalClass}${required ? "" : " optional"}"${conditionalAttrs}${required ? ` data-min-checks="1" data-check-name="${name}"` : ""}>
    <legend>${label}${required ? " *" : ""}</legend><div class="${className}">${options.map(([value, text]) => `<label><input type="checkbox" name="${name}" value="${value}"><span>${text}</span></label>`).join("")}</div>
  </fieldset>`;
}

function dayTime(label = "Which days and times are suitable?") {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return `<fieldset class="question-block" data-min-checks="1" data-check-name="available_days">
    <legend>${label} *</legend><p class="hint">Select every suitable day, then give QAJ a time window.</p>
    <div class="day-time"><div class="days">${days.map(day => `<label><input type="checkbox" name="available_days" value="${day}"><span>${day.slice(0,3)}</span></label>`).join("")}</div>
    <div class="time-grid"><label class="time-cell"><span>From *</span><input name="time_from_12h" type="time" data-required="true"></label><label class="time-cell"><span>Until *</span><input name="time_to_12h" type="time" data-required="true"></label></div></div>
  </fieldset>`;
}

function youngHeartsQuestions() {
  return [
    radio("attended_qaj_before", "Has the learner attended QAJ before?", [["yes", "Yes"], ["no", "No"]]),
    field("student_id", "QAJ Student ID", {placeholder: "Enter the existing student ID", showName: "attended_qaj_before", showValue: "yes"}),
    selectField("introduced_by", "How were you introduced to QAJ?", [["friend_family", "Friend / Family"], ["social", "Instagram / Facebook"], ["workshop", "Workshop"], ["website", "Google / Website"], ["other", "Other"]], {showName: "attended_qaj_before", showValue: "no"}),
    field("introduced_by_other", "Please tell us how", {showName: "introduced_by", showValue: "other"}),
    radio("class_mode", "Preferred class mode", [["online", "Online"], ["physical", "Physical"]]),
    selectField("class_location", "Preferred physical location", [["atapattu_dehiwala", "Atapattu Road — Dehiwala"], ["safa_kalubowila", "Safa Center — Kalubowila"]], {showName: "class_mode", showValue: "physical"}),
    radio("session_type", "How would you like to join?", [["kids_group", "Kids’ group"], ["family", "Family session"]]),
    selectField("family_attendees", "Who will attend the family session?", [["1_child", "1 child"], ["2_children", "2 children"], ["3_children", "3 children"], ["entire_family", "Entire family"]], {showName: "session_type", showValue: "family"}),
    checkGroup("family_age_groups", "Age group of the children", [["4_7", "4 – 7"], ["8_11", "8 – 11"], ["4_11", "4 – 11"]], {required: true, showName: "session_type", showValue: "family"})
  ].join("");
}

function thajweedhQuestions() {
  return [
    radio("quran_reading_level", "Which best describes the learner’s current level?", [["letters_new", "I do not know the letters"], ["join_and_read", "I know to join and read"], ["tajweed_basics", "I know the basics of Thajweedh"], ["test_me", "Test me"]], "This helps QAJ prepare the right starting syllabus."),
    `<div class="assessment-upload conditional" data-when-name="quran_reading_level" data-when-value="test_me" hidden>${field("test_me_audio", "Recitation recording", {type: "file", accept: "audio/*", hint: "Read aloud the first 5 Ayahs of Surah Al-Baqarah and upload one clear audio file (maximum 12 MB)."})}<a class="audio-help" href="https://drive.google.com/file/d/1ZNSsrH3SIHxV4YLDbnVidWevwMa7RVJ9/view?usp=sharing" target="_blank" rel="noreferrer">Open the reading reference before recording ↗</a></div>`,
    dayTime("Which days and times are suitable for Thajweedh?"),
    checkGroup("child_notes", "If registering a small child, what may help the Muallimah?", [["shy", "My child is shy"], ["stern_teacher", "My child needs a firm teacher"], ["friendly_teacher", "My child needs a friendly teacher"]])
  ].join("");
}

function arabicQuestions() {
  return [
    radio("class_mode", "Preferred class mode", [["online", "Online"], ["physical", "Physical"]]),
    selectField("class_location", "Preferred physical location", [["dehiwala", "Dehiwala"], ["kolonnawa", "Kolonnawa"], ["rajagiriya", "Rajagiriya"], ["borella", "Borella"]], {showName: "class_mode", showValue: "physical"}),
    radio("workshop_attended", "Have you attended a QAJ introductory workshop?", [["yes", "Yes"], ["no", "No"]]),
    field("workshop_date", "Workshop date", {type: "date", showName: "workshop_attended", showValue: "yes"}),
    `<div class="notice warning conditional" data-when-name="workshop_attended" data-when-value="no" hidden>Your registration will remain on the waitlist until an introductory workshop has been attended.</div>`,
    radio("preferred_schedule", "Preferred weekly rhythm", [["weekdays", "Weekdays"], ["weekends", "Weekends"]]),
    radio("time_preference", "Preferred time of day", [["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"], ["night", "Night"]]),
    radio("can_read_quran", "Can the learner read the Qur’an?", [["yes", "Yes"], ["no", "No"]]),
    `<div class="notice conditional" data-when-name="can_read_quran" data-when-value="no" hidden>QAJ may recommend beginning with Thajweedh so the learner receives the right foundation first.</div>`
  ].join("");
}

function basicStudiesQuestions() {
  return [
    radio("completed_thajweedh", "Has the learner completed a Thajweedh programme?", [["yes", "Yes"], ["no", "No"]]),
    selectField("thajweedh_where", "Where was Thajweedh completed?", [["qaj", "QAJ"], ["another_institute", "Another institute"]], {showName: "completed_thajweedh", showValue: "yes"}),
    field("student_id", "QAJ Student ID", {showName: "thajweedh_where", showValue: "qaj"}),
    selectField("previous_syllabus", "Which syllabus was completed?", [["thibyan", "Thibyan"], ["qaida", "Qaida"], ["other_mixed", "Other / Mixed"]], {showName: "thajweedh_where", showValue: "another_institute"}),
    radio("enrollment_type", "Choose an enrolment", [["bis_only", "Basic Islamic Studies only"], ["bis_halqa", "Basic Islamic Studies + Qur’an Halqa"]]),
    `<div class="notice warning conditional" data-when-name="completed_thajweedh" data-when-value="no" hidden>The combined Qur’an Halqa option requires prior Thajweedh. Please choose Basic Islamic Studies only for now.</div>`
  ].join("");
}

function intermediaryQuestions() {
  return radio("completed_basic_islamic_studies", "Has the learner completed Basic Islamic Studies?", [["yes", "Yes"], ["no", "No"]]) +
    field("learning_goals", "What would you like the learner to grow in?", {type: "textarea", required: false, placeholder: "Optional notes for the QAJ team"});
}

function halqaQuestions() {
  return radio("quran_reading_level", "Which best describes the learner’s reading?", [["needs_support", "I need support reading"], ["slow", "I can read slowly"], ["fluent", "I can read fluently"], ["assess", "I would like to be assessed"]]) + dayTime("Which days and times are suitable for Qur’an Halqa?");
}

function revertQuestions() {
  return radio("quran_reading_level", "Where would you like to begin?", [["completely_new", "I am completely new"], ["some_letters", "I know some letters"], ["slow", "I read slowly"], ["confidence", "I can read but need confidence"]]) +
    field("support_needs", "Is there anything you would like your teacher to know?", {type: "textarea", required: false, placeholder: "Optional — share only what feels helpful"}) +
    dayTime("Which days and times are suitable?");
}

function renderCourseQuestions(courseId) {
  const course = COURSE_LOOKUP.get(courseId);
  questionHost.dataset.theme = course?.theme || "berry";
  if (YOUNG_HEARTS.has(courseId)) questionHost.innerHTML = youngHeartsQuestions();
  else if (courseId === "thajweedh") questionHost.innerHTML = thajweedhQuestions();
  else if (QA_ARABIC.has(courseId)) questionHost.innerHTML = arabicQuestions();
  else if (courseId === "basic-islamic-studies") questionHost.innerHTML = basicStudiesQuestions();
  else if (courseId === "intermediary-islamic-studies") questionHost.innerHTML = intermediaryQuestions();
  else if (courseId === "quran-halqa") questionHost.innerHTML = halqaQuestions();
  else if (courseId === "quran-revert-sisters") questionHost.innerHTML = revertQuestions();
  else questionHost.innerHTML = "";
  updateConditions();
}

function fieldValue(name) {
  const checked = form.querySelector(`[name="${name}"]:checked`);
  if (checked) return checked.value;
  return form.elements.namedItem(name)?.value || "";
}

function setConditionalState(element, visible) {
  element.hidden = !visible;
  element.querySelectorAll("input, select, textarea").forEach(control => {
    control.disabled = !visible;
    control.required = visible && control.dataset.required === "true";
    if (!visible) control.removeAttribute("aria-invalid");
  });
}

function updateConditions() {
  form.querySelectorAll("[data-show-field]").forEach(element => setConditionalState(element, fieldValue(element.dataset.showField) === element.dataset.showValue));
  questionHost.querySelectorAll("[data-when-name]").forEach(element => setConditionalState(element, fieldValue(element.dataset.whenName) === element.dataset.whenValue));

  const completed = fieldValue("completed_thajweedh");
  const combined = questionHost.querySelector('[name="enrollment_type"][value="bis_halqa"]');
  if (combined) {
    combined.disabled = completed === "no";
    if (combined.disabled && combined.checked) {
      combined.checked = false;
      const bisOnly = questionHost.querySelector('[name="enrollment_type"][value="bis_only"]');
      if (bisOnly) bisOnly.checked = true;
    }
  }
}

function chosenCourse() {
  return form.querySelector('[name="course_code"]:checked')?.value || "";
}

function updateSelectedCourse() {
  const course = COURSE_LOOKUP.get(chosenCourse());
  selectionBar.hidden = !course || currentStep === 0;
  if (course) {
    form.dataset.courseTheme = course.theme;
    selectionBar.style.setProperty("--course-accent", THEME_COLORS[course.theme]);
    selectedCourse.textContent = course.title;
    railCourse.textContent = course.title;
    railGlyph.textContent = activeProgramme?.glyph || "ابدأ";
  } else {
    delete form.dataset.courseTheme;
    selectedCourse.textContent = "";
    railCourse.textContent = activeProgramme?.name || "Choose a course";
    railGlyph.textContent = activeProgramme?.glyph || "ابدأ";
  }
}

function showStep(index, {focus = true} = {}) {
  const railSteps = ["01 / Choose", "02 / Learner", "03 / Placement", "04 / Confirm"];
  const railCopies = [
    "Choose the path that feels closest. QAJ can confirm placement after reviewing the intake.",
    "Use the learner’s own details so QAJ can keep one clear student record.",
    "These answers help the Muallimah understand level, support needs and suitable times.",
    "Check the course and learner, then attach the payment receipt so QAJ can match it correctly."
  ];
  currentStep = Math.max(0, Math.min(steps.length - 1, index));
  steps.forEach((step, i) => {
    const active = i === currentStep;
    step.hidden = !active;
    step.classList.toggle("active", active);
  });
  document.querySelectorAll("[data-progress]").forEach((item, i) => {
    item.classList.toggle("active", i === currentStep);
    item.classList.toggle("complete", i < currentStep);
  });
  railStep.textContent = railSteps[currentStep];
  railCopy.textContent = railCopies[currentStep];
  updateSelectedCourse();
  hideStatus();
  if (currentStep === 3) renderSummary();
  if (focus) {
    formMain.scrollTo?.({top: 0, behavior: "smooth"});
    window.setTimeout(() => steps[currentStep].querySelector("h2")?.focus?.({preventScroll: true}), 250);
  }
}

function showStatus(message) {
  statusBox.textContent = message;
  statusBox.hidden = false;
  statusBox.scrollIntoView({behavior: "smooth", block: "center"});
}

function hideStatus() {
  statusBox.hidden = true;
  statusBox.textContent = "";
}

function visibleControls(step) {
  return [...step.querySelectorAll("input, select, textarea")].filter(control => !control.disabled && !control.closest("[hidden]"));
}

function validateDob(control) {
  if (!control.value) return true;
  const birth = new Date(`${control.value}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  if (age < 4) {
    control.setCustomValidity("The student must be at least 4 years old.");
    return false;
  }
  control.setCustomValidity("");
  return true;
}

function validateFile(control) {
  control.setCustomValidity("");
  if (!control.files?.length) return !control.required;
  const file = control.files[0];
  const isPayment = control.name === "payment_receipt";
  const validType = isPayment ? (file.type.startsWith("image/") || file.type === "application/pdf") : file.type.startsWith("audio/");
  const maxBytes = isPayment ? 6 * 1024 * 1024 : 12 * 1024 * 1024;
  if (!validType) control.setCustomValidity(isPayment ? "Upload an image or PDF receipt." : "Upload an audio recording.");
  else if (file.size > maxBytes) control.setCustomValidity(`File must be smaller than ${isPayment ? 6 : 12} MB.`);
  return control.checkValidity();
}

function validateCurrentStep() {
  hideStatus();
  const step = steps[currentStep];
  const controls = visibleControls(step);
  controls.forEach(control => control.removeAttribute("aria-invalid"));

  const dob = step.querySelector('[name="dob"]');
  if (dob) validateDob(dob);
  controls.filter(control => control.type === "file").forEach(validateFile);

  let customGroupInvalid = null;
  step.querySelectorAll("[data-min-checks]").forEach(group => {
    if (group.hidden || group.closest("[hidden]")) return;
    const count = group.querySelectorAll('input[type="checkbox"]:checked').length;
    group.classList.toggle("invalid", count < Number(group.dataset.minChecks));
    if (count < Number(group.dataset.minChecks) && !customGroupInvalid) customGroupInvalid = group;
  });

  const invalid = controls.find(control => !control.checkValidity());
  if (invalid || customGroupInvalid) {
    if (invalid) {
      invalid.setAttribute("aria-invalid", "true");
      invalid.reportValidity();
      invalid.focus({preventScroll: true});
      invalid.closest(".field, .question-block, .upload-card")?.scrollIntoView({behavior: "smooth", block: "center"});
    } else customGroupInvalid.scrollIntoView({behavior: "smooth", block: "center"});
    showStatus("Please complete the highlighted answer before continuing.");
    return false;
  }
  return true;
}

function renderSummary() {
  const course = COURSE_LOOKUP.get(chosenCourse());
  const name = form.elements.full_name.value || "Not entered";
  const email = form.elements.email.value || "Not entered";
  const summary = document.querySelector("[data-summary]");
  summary.replaceChildren();
  const copy = document.createElement("div");
  const small = document.createElement("small");
  const strong = document.createElement("strong");
  const paragraph = document.createElement("p");
  const edit = document.createElement("button");
  small.textContent = "Registration summary";
  strong.textContent = course?.title || "No course selected";
  paragraph.textContent = `${name} · ${email}`;
  edit.type = "button";
  edit.textContent = "Edit course";
  edit.addEventListener("click", () => showStep(0));
  copy.append(small, strong, paragraph);
  summary.append(copy, edit);
}

function updateFileLabel(control) {
  const label = control.closest("label, .question-block")?.querySelector("[data-file-name], [data-dynamic-file]");
  if (label) label.textContent = control.files?.[0]?.name || (control.name === "payment_receipt" ? "Choose a clear image or PDF · maximum 6 MB" : "Choose an audio file");
  control.closest(".upload-card")?.classList.toggle("has-file", Boolean(control.files?.length));
}

function guideAudience(key) {
  const guide = AUDIENCE_GUIDES[key];
  if (!guide) return;
  document.querySelectorAll("[data-audience]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.audience === key)));
  document.querySelectorAll("[data-programme]").forEach(card => {
    const recommended = guide.programmes.includes(card.dataset.programme);
    card.classList.toggle("recommended", recommended);
    card.classList.toggle("not-recommended", !recommended);
  });
  document.querySelector("[data-audience-copy]").textContent = guide.copy;
  document.querySelector("#programmes")?.scrollIntoView({behavior: "smooth", block: "start"});
}

form.addEventListener("change", event => {
  const control = event.target;
  if (control.name === "course_code") {
    renderCourseQuestions(control.value);
    updateSelectedCourse();
  }
  if (control.type === "file") updateFileLabel(control);
  updateConditions();
  control.removeAttribute("aria-invalid");
  hideStatus();
});

form.addEventListener("input", event => {
  event.target.setCustomValidity?.("");
  event.target.removeAttribute?.("aria-invalid");
});

document.addEventListener("click", event => {
  const moreInfo = event.target.closest("[data-more-info]");
  const register = event.target.closest("[data-register]");
  const directCourse = event.target.closest("[data-register-course]");
  const audience = event.target.closest("[data-audience]");
  const next = event.target.closest("[data-next]");
  const back = event.target.closest("[data-back]");
  if (moreInfo) showProgrammeInfo(moreInfo.dataset.moreInfo);
  if (register) {
    const programme = PROGRAMME_LOOKUP.get(register.dataset.register);
    if (programme?.courseIds.length === 1) startRegistrationForCourse(programme.courseIds[0], {step: 1});
    else startRegistration(register.dataset.register);
  }
  if (directCourse) startRegistrationForCourse(directCourse.dataset.registerCourse, {step: 1});
  if (audience) guideAudience(audience.dataset.audience);
  if (event.target.closest("[data-register-from-info]") && activeProgramme) startRegistrationForCourse(activeProgramme.courseIds[0], {step: 1});
  if (event.target.closest("[data-close-dialog]")) closeDialog();
  if (event.target.closest("[data-edit-course]")) showStep(0);
  if (next && validateCurrentStep()) showStep(currentStep + 1);
  if (back) showStep(currentStep - 1);
  if (event.target.closest("[data-copy-phone]")) {
    form.elements.whatsapp.value = form.elements.phone.value;
    form.elements.whatsapp.focus();
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateCurrentStep()) return;
  form.hidden = true;
  infoPanel.hidden = true;
  successPanel.hidden = false;
  setDialogHeading("Safe preview complete", "Registration checked");
  successPanel.scrollIntoView({behavior: "smooth", block: "start"});
});

document.querySelector("[data-start-over]").addEventListener("click", () => {
  resetRegistration();
  successPanel.hidden = true;
  form.hidden = true;
  closeDialog();
  document.querySelector(`[data-register="${activeProgramme?.id || "thajweedh"}"]`)?.focus();
});

function selectCourseFromUrl() {
  const requested = new URLSearchParams(location.search).get("course");
  if (!requested || !COURSE_LOOKUP.has(requested)) return;
  startRegistrationForCourse(requested);
}

function registerWebMcpTools() {
  const modelContext = navigator.modelContext;
  if (!modelContext?.registerTool) return;
  try {
    modelContext.registerTool({
      name: "start_qaj_registration",
      description: "Choose a QAJ course in the safe registration review and open the learner-details step.",
      inputSchema: {type: "object", properties: {course: {type: "string", enum: [...COURSE_LOOKUP.keys()]}}, required: ["course"]},
      execute: async ({course}) => {
        if (!startRegistrationForCourse(course, {step: 1})) return {content: [{type: "text", text: "Unknown QAJ course."}], isError: true};
        return {content: [{type: "text", text: `Selected ${COURSE_LOOKUP.get(course).title}. The learner-details step is open.`}]};
      }
    });
    modelContext.registerTool({
      name: "check_qaj_registration",
      description: "Check the visible step for missing or invalid required answers without submitting information.",
      inputSchema: {type: "object", properties: {}},
      annotations: {readOnlyHint: true},
      execute: async () => ({content: [{type: "text", text: validateCurrentStep() ? "The visible step is complete." : "The visible step still has a required or invalid answer."}]})
    });
  } catch (error) {
    console.info("WebMCP tools were not registered in this browser.", error);
  }
}

dialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeDialog();
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) closeDialog();
});

renderProgrammeCards();
populateCountries();
selectCourseFromUrl();
updateConditions();
registerWebMcpTools();
