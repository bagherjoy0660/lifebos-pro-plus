// ================== UTILS ==================
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(
    /[&<>"]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m],
  );
}
function getImportanceColor(imp) {
  const map = {
    urgent: "var(--danger)",
    high: "var(--warning)",
    medium: "var(--info)",
    normal: "var(--text3)",
    low: "var(--success)",
  };
  return map[imp] || "var(--text3)";
}
function getImportanceLabel(imp) {
  const map = {
    urgent: "⚡ ضروری",
    high: "🔥 مهم",
    medium: "📌 متوسط",
    normal: "📎 معمولی",
    low: "✅ کم",
  };
  return map[imp] || "معمولی";
}
function getTodayDateString() {
  return new Date().toDateString();
}
function formatFaDate(date) {
  return new Date(date).toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ================== STATE ==================
const DEFAULT_STATE = {
  dailyTasks: [],
  habits: [
    { id: 1, name: "مدیتیشن", streak: 0, doneToday: false, icon: "🧘" },
    { id: 2, name: "مطالعه", streak: 0, doneToday: false, icon: "📖" },
    { id: 3, name: "آب کافی", streak: 0, doneToday: false, icon: "💧" },
  ],
  focusSessions: 0,
  focusMinutes: 0,
  focusLog: [],
  sleepLog: [],
  exerciseLog: [],
  nutritionLog: [],
  waterCups: 0,
  notesList: [],
  goals: [],
  journalEntries: [],
  currentMood: "😊",
  theme: "purple",
  dashboardCards: [
    "mood",
    "planner",
    "habits",
    "focus",
    "water",
    "sleep",
    "goals",
    "meals",
    "exercise",
    "badges",
    "notes",
  ],
  userLevel: 1,
  totalPoints: 0,
  badges: [],
  backgroundType: "default",
  backgroundImage: null,
  scoring: {
    habit: 5,
    subtask: 3,
    focusSession: 10,
    water: 8,
    sleep: 10,
    meals: 5,
    exercise: 8,
    journal: 5,
  },
  lastReset: "",
};

const THEME_COLORS = {
  purple: { main: "#6c5ce7", light: "#a29bfe" },
  blue: { main: "#0984e3", light: "#74b9ff" },
  green: { main: "#00b894", light: "#55efc4" },
  orange: { main: "#e67e22", light: "#fab1a0" },
  red: { main: "#e74c3c", light: "#ff7675" },
  pink: { main: "#fd79a8", light: "#ffeaa7" },
  teal: { main: "#00cec9", light: "#81ecec" },
  gold: { main: "#fdcb6e", light: "#ffeaa7" },
};

const ALL_BADGES = [
  {
    id: "focus_10",
    name: "جنگجوی فوکوس",
    desc: "انجام ۱۰ جلسه تمرکز",
    check: (s) => s.focusSessions >= 10,
  },
  {
    id: "focus_50",
    name: "استاد تمرکز",
    desc: "انجام ۵۰ جلسه تمرکز",
    check: (s) => s.focusSessions >= 50,
  },
  {
    id: "streak_7",
    name: "پایدار",
    desc: "یک عادت با استریک ۷ روزه",
    check: (s) => s.habits.some((h) => h.streak >= 7),
  },
  {
    id: "streak_30",
    name: "افسانه‌ای",
    desc: "یک عادت با استریک ۳۰ روزه",
    check: (s) => s.habits.some((h) => h.streak >= 30),
  },
  {
    id: "water_8",
    name: "کارشناس آب",
    desc: "نوشیدن ۸ لیوان آب در روز",
    check: (s) => s.waterCups >= 8,
  },
  {
    id: "sleep_7",
    name: "خواب حرفه‌ای",
    desc: "۷ ساعت خواب شبانه",
    check: (s) => s.sleepLog.some((l) => l.hours >= 7),
  },
  {
    id: "exercise_daily",
    name: "ورزشکار روزانه",
    desc: "ثبت فعالیت ورزشی در ۵ روز",
    check: (s) => [...new Set(s.exerciseLog.map((e) => e.date))].length >= 5,
  },
  {
    id: "meals_3",
    name: "منظم در تغذیه",
    desc: "ثبت ۳ وعده غذایی در یک روز",
    check: (s) => {
      const today = getTodayDateString();
      return s.nutritionLog.filter((m) => m.date === today).length >= 3;
    },
  },
  {
    id: "journal_7",
    name: "نویسنده هفته",
    desc: "۷ روز ژورنال نویسی",
    check: (s) => s.journalEntries.length >= 7,
  },
  {
    id: "goal_100",
    name: "فاتح اهداف",
    desc: "تکمیل یک هدف ۱۰۰٪",
    check: (s) =>
      s.goals.some((g) => {
        const total = g.subtasks.length;
        return total > 0 && g.subtasks.every((s) => s.done);
      }),
  },
  {
    id: "task_10",
    name: "مدیر وظایف",
    desc: "انجام ۱۰ وظیفه",
    check: (s) =>
      s.dailyTasks.filter(
        (t) => t.subtasks.length > 0 && t.subtasks.every((s) => s.done),
      ).length >= 10,
  },
  {
    id: "points_500",
    name: "ثروتمند",
    desc: "کسب ۵۰۰ امتیاز",
    check: (s) => s.totalPoints >= 500,
  },
  {
    id: "points_2000",
    name: "میلیونر",
    desc: "کسب ۲۰۰۰ امتیاز",
    check: (s) => s.totalPoints >= 2000,
  },
  {
    id: "level_5",
    name: "پیشرو",
    desc: "رسیدن به سطح ۵",
    check: (s) => s.userLevel >= 5,
  },
  {
    id: "level_10",
    name: "افسانه",
    desc: "رسیدن به سطح ۱۰",
    check: (s) => s.userLevel >= 10,
  },
];

const DB_NAME = "LifeBOSProDB";
const DB_VERSION = 1;
const STORE_NAME = "appState";

let db = null;
let dbReady = initDB();

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

async function loadState() {
  await dbReady;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get("state");
    req.onsuccess = () => {
      const data = req.result?.value;
      if (data) {
        const merged = { ...DEFAULT_STATE };
        Object.keys(data).forEach((key) => {
          if (key in merged) merged[key] = data[key];
        });
        if (!Array.isArray(merged.dailyTasks)) merged.dailyTasks = [];
        merged.dailyTasks = merged.dailyTasks.map((task) => ({
          ...task,
          subtasks: Array.isArray(task.subtasks)
            ? task.subtasks.map((sub) => ({
                ...sub,
                importance: sub.importance || "normal",
              }))
            : [],
        }));
        if (!Array.isArray(merged.goals)) merged.goals = [];
        merged.goals = merged.goals.map((goal) => ({
          ...goal,
          subtasks: Array.isArray(goal.subtasks)
            ? goal.subtasks.map((sub) => ({
                ...sub,
                importance: sub.importance || "normal",
              }))
            : [],
        }));
        if (!Array.isArray(merged.habits)) merged.habits = DEFAULT_STATE.habits;
        if (!Array.isArray(merged.notesList)) merged.notesList = [];
        if (!Array.isArray(merged.journalEntries)) merged.journalEntries = [];
        if (!Array.isArray(merged.sleepLog)) merged.sleepLog = [];
        if (!Array.isArray(merged.exerciseLog)) merged.exerciseLog = [];
        if (!Array.isArray(merged.nutritionLog)) merged.nutritionLog = [];
        if (!Array.isArray(merged.focusLog)) merged.focusLog = [];
        if (!Array.isArray(merged.badges)) merged.badges = [];
        if (!Array.isArray(merged.dashboardCards))
          merged.dashboardCards = DEFAULT_STATE.dashboardCards;
        if (typeof merged.userLevel !== "number") merged.userLevel = 1;
        if (typeof merged.totalPoints !== "number") merged.totalPoints = 0;
        if (!["default", "glass", "custom"].includes(merged.backgroundType))
          merged.backgroundType = "default";
        if (
          typeof merged.backgroundImage !== "string" &&
          merged.backgroundImage !== null
        )
          merged.backgroundImage = null;
        if (!THEME_COLORS[merged.theme]) merged.theme = "purple";
        if (!merged.scoring || typeof merged.scoring !== "object")
          merged.scoring = { ...DEFAULT_STATE.scoring };
        Object.keys(DEFAULT_STATE.scoring).forEach((k) => {
          if (typeof merged.scoring[k] !== "number")
            merged.scoring[k] = DEFAULT_STATE.scoring[k];
        });
        resolve(merged);
      } else {
        resolve({ ...DEFAULT_STATE });
      }
    };
    req.onerror = () => resolve({ ...DEFAULT_STATE });
  });
}

async function saveStateToDB(state) {
  await dbReady;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ id: "state", value: state });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ================== GLOBALS ==================
let state = {};
let currentView = "dashboard";

let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroIsBreak = false;
let pomodoroTotalSeconds = 25 * 60;

async function saveState() {
  await saveStateToDB(state);
  updateTopBar();
}

function updateTopBar() {
  document.getElementById("todayDate").textContent = formatFaDate(new Date());
  document.getElementById("moodBadge").textContent = state.currentMood;
  if (state.dailyTasks.length > 0) {
    const totalSub = state.dailyTasks.reduce(
      (acc, t) => acc + t.subtasks.length,
      0,
    );
    const doneSub = state.dailyTasks.reduce(
      (acc, t) => acc + t.subtasks.filter((s) => s.done).length,
      0,
    );
    const percent = totalSub ? Math.round((doneSub / totalSub) * 100) : 0;
    document.getElementById("overallProgress").textContent =
      `📊 ${percent}% امروز`;
  } else {
    document.getElementById("overallProgress").textContent = "📋 بدون وظیفه";
  }
  const levelEl = document.getElementById("levelBadge");
  if (levelEl) levelEl.textContent = `⭐ سطح ${state.userLevel}`;
  const pointsEl = document.getElementById("pointsBadge");
  if (pointsEl) pointsEl.textContent = `💰 ${state.totalPoints} امتیاز`;
}

// ================== RENDER ENGINE ==================
async function render() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  switch (currentView) {
    case "dashboard":
      await renderDashboard(content);
      break;
    case "planner":
      await renderPlanner(content);
      break;
    case "habits":
      await renderHabits(content);
      break;
    case "focus":
      await renderFocus(content);
      break;
    case "wellness":
      await renderWellness(content);
      break;
    case "exercise":
      await renderExercise(content);
      break;
    case "notepad":
      await renderNotepad(content);
      break;
    case "goals":
      await renderGoals(content);
      break;
    case "journal":
      await renderJournal(content);
      break;
  }

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.onclick = () => {
      const view = el.dataset.view;
      if (view) navigateTo(view);
    };
    el.classList.toggle("active", el.dataset.view === currentView);
  });
}

// ================== DASHBOARD ==================
async function renderDashboard(container) {
  const today = getTodayDateString();
  const visible = (cardId) => state.dashboardCards.includes(cardId);

  const totalSub = state.dailyTasks.reduce(
    (acc, t) => acc + t.subtasks.length,
    0,
  );
  const doneSub = state.dailyTasks.reduce(
    (acc, t) => acc + t.subtasks.filter((s) => s.done).length,
    0,
  );
  const taskPercent = totalSub ? Math.round((doneSub / totalSub) * 100) : 0;
  const maxStreak = Math.max(...state.habits.map((h) => h.streak), 0);
  const todaySleep = state.sleepLog.find((s) => s.date === today);
  const todayMeals = state.nutritionLog.filter((m) => m.date === today);

  const habitHtml = state.habits
    .map((h) => {
      const done = h.doneToday;
      return `<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span>${h.icon}</span><span style="flex:1; text-align:right;">${h.name}</span>
            <span style="font-weight:bold; color:${done ? "var(--success)" : "var(--text3)"};">${done ? "✓" : "○"}</span>
            <span style="color:var(--orange);">🔥${h.streak}</span></div>`;
    })
    .join("");

  const sleepStars = todaySleep
    ? Array.from(
        { length: 5 },
        (_, i) =>
          `<span class="star-rating">${i < todaySleep.quality ? "⭐" : "☆"}</span>`,
      ).join("")
    : '<span style="color:var(--text3);">ثبت نشده</span>';

  const mealsHtml = todayMeals.length
    ? todayMeals
        .map(
          (m) =>
            `<div class="meal-item"><span>${m.meal === "صبحانه" ? "🥐" : m.meal === "ناهار" ? "🍛" : m.meal === "شام" ? "🍲" : "🍎"}</span><span>${m.meal}:</span><span style="color:var(--text2);">${m.notes || "بدون توضیح"}</span></div>`,
        )
        .join("")
    : '<p style="color:var(--text3);">امروز وعده‌ای ثبت نشده</p>';

  const goalPercents = state.goals.map((g) => {
    const t = g.subtasks.length,
      d = g.subtasks.filter((s) => s.done).length;
    return t ? Math.round((d / t) * 100) : 0;
  });
  const avgGoal = goalPercents.length
    ? Math.round(goalPercents.reduce((a, b) => a + b, 0) / goalPercents.length)
    : 0;

  const journalSnippet = (
    state.journalEntries.find((j) => j.date === today)?.text ||
    "هنوز ننوشته‌ای..."
  ).substring(0, 80);

  const waterGrid = `<div class="water-grid">${Array.from({ length: 8 }, (_, i) => `<span style="font-size:1.5rem;cursor:pointer;opacity:${i < state.waterCups ? 1 : 0.2};" onclick="setWater(${i + 1})">🥛</span>`).join("")}</div>`;

  const badgesHtml = state.badges.length
    ? state.badges
        .map((bId) => {
          const badge = ALL_BADGES.find((b) => b.id === bId);
          return badge
            ? `<span class="badge" style="background:var(--accent); margin-left:4px;" title="${badge.desc}">${badge.name}</span>`
            : "";
        })
        .join("")
    : '<span style="color:var(--text3);">هنوز نشانی نگرفتی</span>';

  container.innerHTML = `
        ${
          visible("mood")
            ? `
        <div class="card fade-in" style="background:linear-gradient(135deg, var(--accent), var(--pink)); color:white; border:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div><h2 style="margin:0;">${state.currentMood} حال امروز</h2><p style="margin-top:8px; opacity:0.9;">${journalSnippet}</p></div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">${["😄", "😊", "😐", "😕", "😢", "🤩", "😤", "🥱"].map((m) => `<span style="font-size:2rem;cursor:pointer;opacity:${state.currentMood === m ? 1 : 0.5};" onclick="setMood('${m}')">${m}</span>`).join("")}</div>
            </div>
        </div>`
            : ""
        }

        <div class="dashboard-grid">
            ${visible("planner") ? `<div class="quick-link" onclick="navigateTo('planner')"><div class="donut-chart"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="var(--surface3)" stroke-width="3"/><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="${taskPercent}, 100"/></svg><div class="donut-center">${taskPercent}%</div></div><div>📋 برنامه روزانه</div></div>` : ""}
            ${visible("habits") ? `<div class="quick-link" onclick="navigateTo('habits')" style="display:flex; flex-direction:column; justify-content:space-between; height:180px;"><div><div style="font-size:1.5rem;">🔥</div><div>عادت‌ها</div></div><div class="habit-scroll" style="text-align:right; margin-top:8px; font-size:0.8rem; flex:1; min-height:0;">${habitHtml}</div><small>بهترین: ${maxStreak} روز</small></div>` : ""}
            ${visible("focus") ? `<div class="quick-link" onclick="navigateTo('focus')"><div>🎯 جلسات فوکوس</div><div style="font-size:1.5rem; font-weight:bold; margin:8px 0;">${state.focusSessions} جلسه</div><small>${state.focusMinutes} دقیقه</small></div>` : ""}
            ${visible("water") ? `<div class="quick-link" onclick="navigateTo('wellness')"><div>💧 آب</div>${waterGrid}<small>${state.waterCups}/۸ لیوان</small></div>` : ""}
            ${visible("sleep") ? `<div class="quick-link" onclick="navigateTo('wellness')"><div>🌙 خواب دیشب</div><div style="margin:8px 0;">${sleepStars}</div><small>${todaySleep ? `${todaySleep.hours} ساعت` : "ثبت نشده"}</small></div>` : ""}
            ${visible("goals") ? `<div class="quick-link" onclick="navigateTo('goals')"><div>🎯 اهداف</div><div class="donut-chart" style="width:80px;height:80px;"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="var(--surface3)" stroke-width="3"/><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="var(--warning)" stroke-width="3" stroke-dasharray="${avgGoal}, 100"/></svg><div class="donut-center" style="font-size:0.9rem;">${avgGoal}%</div></div><small>پیشرفت کلی</small></div>` : ""}
        </div>

        ${
          visible("meals") || visible("exercise")
            ? `
        <div class="grid2">
            ${visible("meals") ? `<div class="card fade-in"><h3>🍽️ وعده‌های امروز</h3><div>${mealsHtml}</div></div>` : ""}
            ${
              visible("exercise")
                ? `<div class="card fade-in"><h3>🏃 فعالیت اخیر</h3>${
                    state.exerciseLog
                      .slice(-3)
                      .reverse()
                      .map(
                        (e) =>
                          `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);"><span>${e.type}</span><span>${e.minutes} دقیقه</span></div>`,
                      )
                      .join("") ||
                    '<p style="color:var(--text3);">بدون فعالیت</p>'
                  }</div>`
                : ""
            }
        </div>`
            : ""
        }

        ${visible("badges") ? `<div class="card fade-in"><h3>🏅 نشان‌ها</h3><div>${badgesHtml}</div></div>` : ""}
        ${
          visible("notes")
            ? `<div class="card fade-in"><h3>📝 آخرین یادداشت‌ها</h3>${
                state.notesList
                  .slice(-2)
                  .reverse()
                  .map(
                    (n) =>
                      `<div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="navigateTo('notepad')"><strong>${escapeHtml(n.title)}</strong><p style="color:var(--text2);">${escapeHtml(n.content).substring(0, 70)}...</p></div>`,
                  )
                  .join("") ||
                '<p style="color:var(--text3);">یادداشتی نیست</p>'
              }</div>`
            : ""
        }
    `;
}

// ================== PLANNER ==================
async function renderPlanner(container) {
  let html = `<div class="card fade-in"><div style="display:flex; justify-content:space-between;"><h2>📋 برنامه امروز</h2><button class="primary" onclick="addNewTask()">+ افزودن وظیفه</button></div><div>`;
  state.dailyTasks.forEach((task) => {
    const done = task.subtasks.filter((s) => s.done).length;
    const total = task.subtasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    html += `<div class="card fade-in importance-${task.importance || "medium"}" style="margin-bottom:20px; border-radius:16px;">
            <div style="display:flex; justify-content:space-between;"><div style="display:flex; gap:10px;"><span class="badge" style="background:${getImportanceColor(task.importance)};color:#fff;">${getImportanceLabel(task.importance)}</span><strong>${escapeHtml(task.title)}</strong></div><div style="display:flex; gap:8px;"><span class="badge">${pct}%</span><button class="small" onclick="editTask(${task.id})">✏️</button><button class="small danger" onclick="deleteTask(${task.id})">🗑️</button></div></div>
            <div class="progress-bar" style="margin-bottom:12px;"><div class="progress-fill" style="width:${pct}%;"></div></div><div>`;
    task.subtasks.forEach((sub) => {
      html += `<div class="subtask-item"><input type="checkbox" ${sub.done ? "checked" : ""} onchange="toggleSubtask(${task.id},${sub.id})" style="width:20px;height:20px;accent-color:var(--accent);"><span style="flex:1;text-decoration:${sub.done ? "line-through" : ""};">${escapeHtml(sub.text)}</span><span class="badge" style="background:${getImportanceColor(sub.importance || "normal")};color:#fff;">${getImportanceLabel(sub.importance || "normal")}</span></div>`;
    });
    html += `</div><button class="small" style="margin-top:10px;" onclick="addSubtask(${task.id})">+ زیروظیفه</button></div>`;
  });
  html += `</div></div>`;
  container.innerHTML = html || "<p>وظیفه‌ای نداری</p>";
}
window.addNewTask = async function () {
  const t = prompt("عنوان:");
  if (!t || !t.trim()) return;
  const imp = prompt("اهمیت (urgent/high/medium/normal/low):", "medium");
  state.dailyTasks.push({
    id: Date.now(),
    title: t.trim(),
    importance: ["urgent", "high", "medium", "normal", "low"].includes(imp)
      ? imp
      : "medium",
    subtasks: [],
  });
  await saveState();
  await render();
};
window.editTask = async function (id) {
  const task = state.dailyTasks.find((t) => t.id === id);
  if (!task) return;
  const t = prompt("عنوان:", task.title);
  if (t && t.trim()) task.title = t.trim();
  const imp = prompt("اهمیت:", task.importance);
  if (imp && ["urgent", "high", "medium", "normal", "low"].includes(imp))
    task.importance = imp;
  await saveState();
  await render();
};
window.deleteTask = async function (id) {
  if (!confirm("حذف؟")) return;
  state.dailyTasks = state.dailyTasks.filter((t) => t.id !== id);
  await saveState();
  await render();
};
window.addSubtask = async function (taskId) {
  const text = prompt("زیروظیفه:");
  if (!text) return;
  const imp = prompt("اهمیت:", "normal");
  const task = state.dailyTasks.find((t) => t.id === taskId);
  if (!task) return;
  task.subtasks.push({
    id: Date.now(),
    text: text.trim(),
    done: false,
    importance: ["urgent", "high", "medium", "normal", "low"].includes(imp)
      ? imp
      : "normal",
  });
  await saveState();
  await render();
};
window.toggleSubtask = async function (taskId, subId) {
  const task = state.dailyTasks.find((t) => t.id === taskId);
  if (!task) return;
  const sub = task.subtasks.find((s) => s.id === subId);
  if (!sub) return;
  sub.done = !sub.done;
  await saveState();
  await render();
};

// ================== HABITS ==================
async function renderHabits(container) {
  let html = `<div class="card fade-in"><h2>✅ عادت‌های روزانه</h2><button class="primary" style="margin:12px 0;" onclick="addHabit()">+ عادت جدید</button>`;
  state.habits.forEach((h) => {
    html += `<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface2);border-radius:12px;margin-bottom:8px;"><span>${h.icon}</span><span style="flex:1;">${h.name}</span><span class="badge" style="background:${h.doneToday ? "var(--success)" : "var(--surface3)"};cursor:pointer;" onclick="toggleHabit(${h.id})">${h.doneToday ? "✓ انجام شد" : "انجام نشده"}</span><span>🔥${h.streak}</span><button class="small danger" onclick="deleteHabit(${h.id})">🗑️</button></div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}
window.addHabit = async function () {
  const name = prompt("نام عادت:");
  if (!name) return;
  const icon = prompt("آیکون:", "•");
  const id = Math.max(0, ...state.habits.map((h) => h.id), 0) + 1;
  state.habits.push({ id, name, streak: 0, doneToday: false, icon });
  await saveState();
  await render();
};
window.toggleHabit = async function (id) {
  const h = state.habits.find((x) => x.id === id);
  if (!h) return;
  h.doneToday = !h.doneToday;
  h.streak = h.doneToday ? h.streak + 1 : Math.max(0, h.streak - 1);
  await saveState();
  await render();
};
window.deleteHabit = async function (id) {
  state.habits = state.habits.filter((h) => h.id !== id);
  await saveState();
  await render();
};

// ================== FOCUS ==================
async function renderFocus(container) {
  const m = Math.floor(pomodoroSeconds / 60),
    s = pomodoroSeconds % 60;
  container.innerHTML = `<div class="card fade-in" style="text-align:center;"><h2>🎯 تمرکز پومودورو</h2><div class="pomodoro-circle ${pomodoroRunning ? (pomodoroIsBreak ? "break" : "running") : ""}" id="pomoDisplay">${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}</div><div style="display:flex;gap:8px;justify-content:center;"><button class="${!pomodoroRunning && pomodoroTotalSeconds === 25 * 60 ? "primary" : ""}" onclick="setPomo(25)">۲۵ دقیقه</button><button class="${!pomodoroRunning && pomodoroTotalSeconds === 45 * 60 ? "primary" : ""}" onclick="setPomo(45)">۴۵ دقیقه</button><button class="${!pomodoroRunning && pomodoroTotalSeconds === 5 * 60 ? "primary" : ""}" onclick="setPomo(5)">۵ دقیقه استراحت</button></div><div style="margin-top:12px; display:flex; gap:8px; justify-content:center;"><input type="number" id="customPomoMinutes" placeholder="دقیقه دلخواه" min="1" style="width:100px; text-align:center;"><button onclick="setCustomPomo()">⏱ تنظیم</button></div><div style="margin-top:16px;">${pomodoroRunning ? `<button class="danger" onclick="stopPomo()">⏹ توقف</button><button onclick="pausePomo()">⏸ مکث</button>` : `<button class="primary" onclick="startPomo()">▶ شروع</button>`}<button onclick="resetPomo()">↺ ریست</button></div><p>جلسات: ${state.focusSessions} | دقایق: ${state.focusMinutes}</p></div>`;
}
function setCustomPomo() {
  const input = document.getElementById("customPomoMinutes");
  if (!input) return;
  const mins = parseInt(input.value);
  if (isNaN(mins) || mins <= 0) return alert("لطفاً یک عدد معتبر وارد کن");
  if (pomodoroRunning) return;
  pomodoroSeconds = mins * 60;
  pomodoroTotalSeconds = mins * 60;
  pomodoroIsBreak = false;
  render();
}
function setPomo(min) {
  if (pomodoroRunning) return;
  pomodoroSeconds = min * 60;
  pomodoroTotalSeconds = min * 60;
  pomodoroIsBreak = min <= 10;
  render();
}
function startPomo() {
  if (pomodoroRunning) return;
  pomodoroRunning = true;
  render();
  pomodoroTimer = setInterval(() => {
    if (pomodoroSeconds <= 0) {
      clearInterval(pomodoroTimer);
      pomodoroRunning = false;
      if (!pomodoroIsBreak && pomodoroTotalSeconds >= 20 * 60) {
        state.focusSessions++;
        state.focusMinutes += Math.floor(pomodoroTotalSeconds / 60);
        const today = getTodayDateString();
        const ex = state.focusLog.find((l) => l.date === today);
        if (ex) {
          ex.sessions++;
          ex.minutes += Math.floor(pomodoroTotalSeconds / 60);
        } else {
          state.focusLog.push({
            date: today,
            sessions: 1,
            minutes: Math.floor(pomodoroTotalSeconds / 60),
          });
        }
        saveState();
      }
      alert(pomodoroIsBreak ? "استراحت تموم شد!" : "پومودورو تموم شد!");
      pomodoroSeconds = pomodoroIsBreak ? 25 * 60 : 5 * 60;
      pomodoroTotalSeconds = pomodoroSeconds;
      pomodoroIsBreak = !pomodoroIsBreak;
      render();
      return;
    }
    pomodoroSeconds--;
    const d = document.getElementById("pomoDisplay");
    if (d) {
      const mm = Math.floor(pomodoroSeconds / 60),
        ss = pomodoroSeconds % 60;
      d.textContent = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    }
  }, 1000);
}
function pausePomo() {
  clearInterval(pomodoroTimer);
  pomodoroRunning = false;
  render();
}
function stopPomo() {
  clearInterval(pomodoroTimer);
  pomodoroRunning = false;
  pomodoroSeconds = pomodoroTotalSeconds;
  render();
}
function resetPomo() {
  clearInterval(pomodoroTimer);
  pomodoroRunning = false;
  pomodoroSeconds = pomodoroTotalSeconds;
  render();
}

// ================== WELLNESS ==================
async function renderWellness(container) {
  const today = getTodayDateString();
  const todaySleep = state.sleepLog.find((s) => s.date === today);
  const meals = state.nutritionLog.filter((m) => m.date === today);
  container.innerHTML = `<div class="grid2"><div class="card fade-in"><h2>💧 آب</h2><div style="display:flex;gap:8px;flex-wrap:wrap;">${Array.from({ length: 8 }, (_, i) => `<span style="font-size:2rem;cursor:pointer;opacity:${i < state.waterCups ? 1 : 0.3};" onclick="setWater(${i + 1})">🥛</span>`).join("")}</div><p>${state.waterCups}/۸</p></div><div class="card fade-in"><h2>🌙 خواب</h2><input id="sleepHours" placeholder="ساعت" value="${todaySleep?.hours || ""}"><input id="sleepQuality" placeholder="کیفیت" value="${todaySleep?.quality || ""}" style="margin-top:8px;"><button class="primary" onclick="logSleep()">ثبت</button></div><div class="card fade-in" style="grid-column:span 2;"><h2>🍽️ وعده‌ها</h2><div style="display:flex;gap:8px;margin:12px 0;"><select id="mealType"><option>صبحانه</option><option>ناهار</option><option>شام</option><option>میان‌وعده</option></select><input id="mealNotes" placeholder="توضیح"><button class="primary" onclick="logMeal()">+ ثبت</button></div><div>${meals.map((m) => `<p><strong>${m.meal}:</strong> ${m.notes || ""}</p>`).join("")}</div></div></div>`;
}
window.setWater = async function (n) {
  state.waterCups = Math.min(8, n);
  await saveState();
  await render();
};
window.logSleep = async function () {
  const h = +document.getElementById("sleepHours")?.value,
    q = +document.getElementById("sleepQuality")?.value;
  if (!h || !q) return;
  const today = getTodayDateString();
  const idx = state.sleepLog.findIndex((s) => s.date === today);
  if (idx >= 0) state.sleepLog[idx] = { date: today, hours: h, quality: q };
  else state.sleepLog.push({ date: today, hours: h, quality: q });
  await saveState();
  await render();
};
window.logMeal = async function () {
  const meal = document.getElementById("mealType")?.value,
    notes = document.getElementById("mealNotes")?.value?.trim();
  if (!meal) return;
  state.nutritionLog.push({
    date: getTodayDateString(),
    meal,
    notes: notes || "",
  });
  await saveState();
  await render();
};

// ================== EXERCISE ==================
async function renderExercise(container) {
  const today = getTodayDateString();
  container.innerHTML = `<div class="card fade-in"><h2>🏃 فعالیت</h2><div style="display:flex;gap:8px;"><input id="exType" placeholder="نوع"><input id="exMins" placeholder="دقیقه"><button class="primary" onclick="logExercise()">ثبت</button></div><h3>امروز:</h3>${state.exerciseLog
    .filter((e) => e.date === today)
    .map((e) => `<p>${e.type} - ${e.minutes} دقیقه</p>`)
    .join("")}</div>`;
}
window.logExercise = async function () {
  const type = document.getElementById("exType")?.value,
    mins = +document.getElementById("exMins")?.value;
  if (!type || !mins) return;
  state.exerciseLog.push({ date: getTodayDateString(), type, minutes: mins });
  await saveState();
  await render();
};

// ================== NOTEPAD (با پشتیبانی از متن چندخطی و عکس) ==================
function showNotepadModal(existingNote = null) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.style.zIndex = "300";

    const isEdit = !!existingNote;
    const titleValue = existingNote?.title || "";
    const contentValue = existingNote?.content || "";
    const imageSrc = existingNote?.image || "";

    overlay.innerHTML = `
            <div class="settings-modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>${isEdit ? "✏️ ویرایش یادداشت" : "📝 یادداشت جدید"}</h2>
                    <button class="close-btn" id="closeNoteModal">✕</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="noteTitle" placeholder="عنوان یادداشت" value="${escapeHtml(titleValue)}" style="margin-bottom:12px;">
                    <textarea id="noteContent" placeholder="متن یادداشت را اینجا بنویسید..." style="min-height:120px; margin-bottom:12px;">${escapeHtml(contentValue)}</textarea>
                    <div style="margin-bottom:8px;">
                        <label class="upload-btn" style="display:inline-block; cursor:pointer;">
                            📷 ${imageSrc ? "تغییر تصویر" : "افزودن تصویر"}
                            <input type="file" id="noteImageInput" accept="image/*" style="display:none;">
                        </label>
                        ${imageSrc ? '<button class="small danger" id="removeImageBtn" style="margin-left:8px;">🗑️ حذف تصویر</button>' : ""}
                    </div>
                    <div id="noteImagePreview" style="margin-top:8px;">
                        ${imageSrc ? `<img src="${imageSrc}" style="max-width:100%; max-height:150px; border-radius:8px;">` : ""}
                    </div>
                    <div style="display:flex; gap:8px; margin-top:16px;">
                        <button class="primary" id="saveNoteBtn" style="flex:1;">💾 ذخیره</button>
                        <button id="cancelNoteBtn" style="flex:1;">لغو</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);

    const closeModal = () => {
      overlay.remove();
      resolve(null);
    };

    overlay.querySelector("#closeNoteModal").onclick = closeModal;
    overlay.querySelector("#cancelNoteBtn").onclick = closeModal;

    let selectedImageData = existingNote?.image || null;

    const imageInput = overlay.querySelector("#noteImageInput");
    imageInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        selectedImageData = ev.target.result;
        const preview = overlay.querySelector("#noteImagePreview");
        preview.innerHTML = `<img src="${selectedImageData}" style="max-width:100%; max-height:150px; border-radius:8px;">`;
        if (!overlay.querySelector("#removeImageBtn")) {
          const removeBtn = document.createElement("button");
          removeBtn.className = "small danger";
          removeBtn.id = "removeImageBtn";
          removeBtn.style.marginLeft = "8px";
          removeBtn.textContent = "🗑️ حذف تصویر";
          removeBtn.onclick = () => {
            selectedImageData = null;
            preview.innerHTML = "";
            removeBtn.remove();
            imageInput.value = "";
          };
          imageInput.parentElement.after(removeBtn);
        }
      };
      reader.readAsDataURL(file);
    };

    const removeBtn = overlay.querySelector("#removeImageBtn");
    if (removeBtn) {
      removeBtn.onclick = () => {
        selectedImageData = null;
        overlay.querySelector("#noteImagePreview").innerHTML = "";
        removeBtn.remove();
        imageInput.value = "";
      };
    }

    overlay.querySelector("#saveNoteBtn").onclick = () => {
      const title = overlay.querySelector("#noteTitle").value.trim();
      if (!title) {
        alert("عنوان نمی‌تواند خالی باشد.");
        return;
      }
      const content = overlay.querySelector("#noteContent").value.trim();
      resolve({ title, content, image: selectedImageData });
      overlay.remove();
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
  });
}

window.addNote = async function () {
  const result = await showNotepadModal();
  if (!result) return;
  state.notesList.push({
    id: Date.now(),
    title: result.title,
    content: result.content,
    image: result.image,
    date: new Date().toLocaleDateString("fa-IR"),
  });
  await saveState();
  await render();
};

window.editNote = async function (id) {
  const note = state.notesList.find((n) => n.id === id);
  if (!note) return;
  const result = await showNotepadModal(note);
  if (!result) return;
  note.title = result.title;
  note.content = result.content;
  note.image = result.image;
  await saveState();
  await render();
};

window.deleteNote = async function (id) {
  if (!confirm("حذف این یادداشت؟")) return;
  state.notesList = state.notesList.filter((n) => n.id !== id);
  await saveState();
  await render();
};

async function renderNotepad(container) {
  let html = `<div class="card fade-in"><div style="display:flex;justify-content:space-between;"><h2>📝 یادداشت‌ها</h2><button class="primary" onclick="addNote()">+ جدید</button></div><div style="margin-top:20px;">`;
  if (state.notesList.length === 0) {
    html +=
      '<p style="color:var(--text3); text-align:center;">هنوز یادداشتی نداری.</p>';
  } else {
    state.notesList.forEach((note) => {
      html += `<div class="card" style="margin-bottom:16px; background:var(--surface2);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${escapeHtml(note.title)}</strong>
                    <small style="color:var(--text3);">${note.date}</small>
                </div>
                <p style="margin-top:8px; white-space:pre-wrap;">${escapeHtml(note.content)}</p>
                ${note.image ? `<img src="${note.image}" class="note-image" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:8px;" alt="تصویر یادداشت">` : ""}
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <button class="small" onclick="editNote(${note.id})">✏️ ویرایش</button>
                    <button class="small danger" onclick="deleteNote(${note.id})">🗑️ حذف</button>
                </div>
            </div>`;
    });
  }
  html += `</div></div>`;
  container.innerHTML = html;
}

// ================== GOALS ==================
async function renderGoals(container) {
  let html = `<div class="card fade-in"><h2>🎯 اهداف</h2><button class="primary" onclick="addGoal()">+ هدف جدید</button>`;
  state.goals.forEach((goal) => {
    const t = goal.subtasks.length,
      d = goal.subtasks.filter((s) => s.done).length,
      pct = t ? Math.round((d / t) * 100) : 0;
    html += `<div class="card importance-${goal.importance}" style="margin-bottom:20px;background:var(--surface2);"><div style="display:flex;justify-content:space-between;"><div><span class="badge" style="background:${getImportanceColor(goal.importance)};color:#fff;">${getImportanceLabel(goal.importance)}</span><strong>${escapeHtml(goal.title)}</strong></div><div><span class="badge">${pct}%</span><button class="small" onclick="editGoal(${goal.id})">✏️</button><button class="small danger" onclick="deleteGoal(${goal.id})">🗑️</button></div></div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div><div>${goal.subtasks.map((sub) => `<div class="subtask-item"><input type="checkbox" ${sub.done ? "checked" : ""} onchange="toggleGoalSubtask(${goal.id},${sub.id})"><span>${escapeHtml(sub.text)}</span><span class="badge">${getImportanceLabel(sub.importance)}</span></div>`).join("")}</div><button class="small" onclick="addGoalSubtask(${goal.id})">+ زیرهدف</button></div>`;
  });
  container.innerHTML = html;
}
window.addGoal = async function () {
  const t = prompt("هدف:");
  if (!t) return;
  const imp = prompt("اهمیت:", "medium");
  state.goals.push({ id: Date.now(), title: t, importance: imp, subtasks: [] });
  await saveState();
  await render();
};
window.editGoal = async function (id) {
  const g = state.goals.find((x) => x.id === id);
  if (!g) return;
  const t = prompt("عنوان:", g.title);
  if (t) g.title = t;
  const imp = prompt("اهمیت:", g.importance);
  if (imp) g.importance = imp;
  await saveState();
  await render();
};
window.deleteGoal = async function (id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  await saveState();
  await render();
};
window.addGoalSubtask = async function (gid) {
  const text = prompt("زیرهدف:");
  if (!text) return;
  const imp = prompt("اهمیت:", "normal");
  const goal = state.goals.find((g) => g.id === gid);
  if (!goal) return;
  goal.subtasks.push({ id: Date.now(), text, importance: imp, done: false });
  await saveState();
  await render();
};
window.toggleGoalSubtask = async function (gid, sid) {
  const goal = state.goals.find((g) => g.id === gid);
  const sub = goal?.subtasks.find((s) => s.id === sid);
  if (!sub) return;
  sub.done = !sub.done;
  await saveState();
  await render();
};

// ================== JOURNAL ==================
async function renderJournal(container) {
  const today = getTodayDateString();
  const entry = state.journalEntries.find((j) => j.date === today);
  container.innerHTML = `<div class="card fade-in"><h2>📖 ژورنال</h2><div>${["😄", "😊", "😐", "😕", "😢", "🤩", "😤", "🥱"].map((m) => `<span style="font-size:2rem;cursor:pointer;opacity:${state.currentMood === m ? 1 : 0.5};" onclick="setMood('${m}')">${m}</span>`).join("")}</div><textarea id="journalText" style="min-height:200px;">${entry?.text || ""}</textarea><button class="primary" onclick="saveJournal()">💾 ذخیره</button><div>${state.journalEntries
    .slice(-5)
    .reverse()
    .map(
      (j) =>
        `<div><strong>${j.date}</strong> - ${j.mood}<p>${escapeHtml(j.text).substring(0, 100)}...</p></div>`,
    )
    .join("")}</div></div>`;
}
window.setMood = async function (m) {
  state.currentMood = m;
  await saveState();
  await render();
};
window.saveJournal = async function () {
  const text = document.getElementById("journalText")?.value.trim();
  if (!text) return;
  const today = getTodayDateString();
  const idx = state.journalEntries.findIndex((j) => j.date === today);
  if (idx >= 0)
    state.journalEntries[idx] = { date: today, mood: state.currentMood, text };
  else
    state.journalEntries.push({ date: today, mood: state.currentMood, text });
  await saveState();
  await render();
};

// ================== BACKUP / RESTORE ==================
window.exportData = async function () {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifebos-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importData = async function () {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (confirm("آیا مطمئنی؟ این کار داده‌های فعلی رو جایگزین می‌کنه.")) {
        state = { ...DEFAULT_STATE, ...json };
        await saveState();
        render();
      }
    } catch (err) {
      alert("فایل معتبر نیست!");
    }
  };
  input.click();
};

// ================== SECTION BACKUP & RESTORE ==================
const SECTION_MAP = {
  planner: "dailyTasks",
  habits: "habits",
  focus: "focusLog",
  wellness: "sleepLog",
  exercise: "exerciseLog",
  nutrition: "nutritionLog",
  water: "waterCups",
  notepad: "notesList",
  goals: "goals",
  journal: "journalEntries",
};

function exportSection(sectionKey) {
  const stateKey = SECTION_MAP[sectionKey];
  if (!stateKey) return;
  const sectionData = state[stateKey];
  const exportObj = { type: sectionKey, data: sectionData };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifebos-${sectionKey}-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importSection(sectionKey) {
  const stateKey = SECTION_MAP[sectionKey];
  if (!stateKey) return;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const importObj = JSON.parse(text);
      if (importObj.type === sectionKey && importObj.data !== undefined) {
        if (
          confirm(
            `آیا مطمئنی؟ داده‌های بخش "${sectionKey}" با این فایل جایگزین می‌شود.`,
          )
        ) {
          state[stateKey] = importObj.data;
          await saveState();
          render();
        }
      } else {
        alert(`فایل انتخاب شده مربوط به بخش "${sectionKey}" نیست.`);
      }
    } catch (err) {
      alert("فایل معتبر نیست!");
    }
  };
  input.click();
}

function buildSectionBackupUI() {
  const list = document.getElementById("sectionBackupList");
  if (!list) return;
  const sections = [
    { key: "planner", label: "📋 برنامه روزانه" },
    { key: "habits", label: "✅ عادت‌ها" },
    { key: "focus", label: "🎯 تمرکز" },
    { key: "wellness", label: "🌙 خواب" },
    { key: "exercise", label: "🏃 تحرک" },
    { key: "nutrition", label: "🍽️ تغذیه" },
    { key: "water", label: "💧 آب" },
    { key: "notepad", label: "📝 یادداشت‌ها" },
    { key: "goals", label: "🎯 اهداف" },
    { key: "journal", label: "📖 ژورنال" },
  ];
  list.innerHTML = sections
    .map((sec) => {
      return `<div class="settings-item" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${sec.label}</span>
            <div class="btn-group" style="display:flex; gap:8px;">
                <button class="small" onclick="exportSection('${sec.key}')">📥 بکاپ</button>
                <button class="small" onclick="importSection('${sec.key}')">📤 بازیابی</button>
            </div>
        </div>`;
    })
    .join("");
}

// ================== GAMIFICATION ==================
window.calculateTodayPoints = async function () {
  const sc = state.scoring;
  let points = 0;
  state.habits.forEach((h) => {
    if (h.doneToday) points += sc.habit;
  });
  state.dailyTasks.forEach((t) => {
    t.subtasks.forEach((s) => {
      if (s.done) points += sc.subtask;
    });
  });
  if (state.focusSessions > 0) points += state.focusSessions * sc.focusSession;
  if (state.waterCups >= 8) points += sc.water;
  const today = getTodayDateString();
  if (state.sleepLog.find((s) => s.date === today && s.hours >= 7))
    points += sc.sleep;
  if (state.nutritionLog.filter((m) => m.date === today).length >= 3)
    points += sc.meals;
  if (state.exerciseLog.filter((e) => e.date === today).length > 0)
    points += sc.exercise;
  if (state.journalEntries.find((j) => j.date === today)) points += sc.journal;

  const oldLevel = state.userLevel;
  state.totalPoints += points;
  const newLevel = Math.floor(state.totalPoints / 100) + 1;
  if (newLevel > oldLevel) {
    state.userLevel = newLevel;
    alert(`🎉 تبریک! به سطح ${newLevel} رسیدی!`);
  }
  for (const badge of ALL_BADGES) {
    if (!state.badges.includes(badge.id) && badge.check(state)) {
      state.badges.push(badge.id);
      alert(`🏅 نشان جدید: «${badge.name}» — ${badge.desc}`);
    }
  }
  await saveState();
  updateTopBar();
};

// ================== THEME ==================
window.changeTheme = function (themeName) {
  if (!THEME_COLORS[themeName]) return;
  document.documentElement.style.setProperty(
    "--accent",
    THEME_COLORS[themeName].main,
  );
  document.documentElement.style.setProperty(
    "--pink",
    THEME_COLORS[themeName].light,
  );
  state.theme = themeName;
  saveState();
};
window.toggleTheme = function () {
  document.body.classList.toggle("light");
};

// ================== SETTINGS MODAL ==================
window.openSettingsModal = function () {
  const modal = document.getElementById("settingsModal");
  if (!modal) return;
  modal.classList.add("active");
  document
    .querySelectorAll("#settingsModal .tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector('#settingsModal .tab-btn[data-tab="general"]')
    .classList.add("active");
  document
    .querySelectorAll("#settingsModal .tab-content")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById("tab-general").classList.add("active");
  const cards = [
    { id: "mood", label: "😊 حال امروز" },
    { id: "planner", label: "📋 برنامه روزانه" },
    { id: "habits", label: "🔥 عادت‌ها" },
    { id: "focus", label: "🎯 جلسات فوکوس" },
    { id: "water", label: "💧 آب" },
    { id: "sleep", label: "🌙 خواب دیشب" },
    { id: "goals", label: "🎯 اهداف" },
    { id: "meals", label: "🍽️ وعده‌های امروز" },
    { id: "exercise", label: "🏃 فعالیت اخیر" },
    { id: "badges", label: "🏅 نشان‌ها" },
    { id: "notes", label: "📝 یادداشت‌ها" },
  ];
  const list = document.getElementById("dashboardCardsList");
  if (list) {
    list.innerHTML = cards
      .map((card) => {
        const checked = state.dashboardCards.includes(card.id) ? "checked" : "";
        return `<label><input type="checkbox" value="${card.id}" ${checked} onchange="toggleDashboardCard('${card.id}', this.checked)"> ${card.label}</label>`;
      })
      .join("");
  }
  const picker = document.getElementById("themeColorPicker");
  if (picker) {
    picker.innerHTML = Object.keys(THEME_COLORS)
      .map((color) => {
        const selected = state.theme === color ? "selected" : "";
        return `<div class="color-swatch ${selected}" style="background-color: ${THEME_COLORS[color].main}" onclick="changeTheme('${color}'); document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected')); this.classList.add('selected');"></div>`;
      })
      .join("");
  }
  const bgSelect = document.getElementById("bgTypeSelect");
  if (bgSelect) bgSelect.value = state.backgroundType || "default";
  const uploadDiv = document.getElementById("customBgUpload");
  if (uploadDiv)
    uploadDiv.style.display =
      state.backgroundType === "custom" ? "block" : "none";
  const preview = document.getElementById("bgPreview");
  if (preview && state.backgroundImage) {
    preview.style.backgroundImage = `url(${state.backgroundImage})`;
    preview.style.display = "block";
  } else if (preview) {
    preview.style.display = "none";
  }
  document.querySelectorAll("#settingsModal .tab-btn").forEach((btn) => {
    btn.onclick = function () {
      document
        .querySelectorAll("#settingsModal .tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      document
        .querySelectorAll("#settingsModal .tab-content")
        .forEach((c) => c.classList.remove("active"));
      const target = document.getElementById("tab-" + this.dataset.tab);
      if (target) target.classList.add("active");
      if (this.dataset.tab === "scoring") window.buildScoringFields();
      if (this.dataset.tab === "backup") buildSectionBackupUI();
    };
  });
};
window.closeSettingsModal = function () {
  document.getElementById("settingsModal").classList.remove("active");
};
window.toggleDashboardCard = function (cardId, isChecked) {
  if (isChecked) {
    if (!state.dashboardCards.includes(cardId))
      state.dashboardCards.push(cardId);
  } else {
    state.dashboardCards = state.dashboardCards.filter((id) => id !== cardId);
  }
  saveState();
  render();
};

// ================== SCORING FIELDS ==================
window.buildScoringFields = function () {
  const container = document.getElementById("scoringFields");
  if (!container) return;
  const labels = {
    habit: "هر عادت انجام‌شده",
    subtask: "هر زیروظیفه انجام‌شده",
    focusSession: "هر جلسه فوکوس",
    water: "نوشیدن ۸ لیوان آب",
    sleep: "خواب ≥ ۷ ساعت",
    meals: "ثبت ۳ وعده غذایی",
    exercise: "ثبت فعالیت ورزشی",
    journal: "نوشتن ژورنال روزانه",
  };
  const ranges = {
    habit: [1, 20],
    subtask: [1, 15],
    focusSession: [1, 50],
    water: [1, 20],
    sleep: [1, 30],
    meals: [1, 15],
    exercise: [1, 20],
    journal: [1, 15],
  };
  container.innerHTML = Object.keys(labels)
    .map((key) => {
      return `<div class="scoring-row">
            <label>${labels[key]}</label>
            <input type="number" id="score_${key}" value="${state.scoring[key]}" min="${ranges[key][0]}" max="${ranges[key][1]}" onchange="updateScoring('${key}', this.value)">
        </div>`;
    })
    .join("");
};
window.updateScoring = function (key, value) {
  const val = parseInt(value);
  const ranges = {
    habit: [1, 20],
    subtask: [1, 15],
    focusSession: [1, 50],
    water: [1, 20],
    sleep: [1, 30],
    meals: [1, 15],
    exercise: [1, 20],
    journal: [1, 15],
  };
  if (isNaN(val) || val < ranges[key][0] || val > ranges[key][1]) {
    alert(`مقدار باید بین ${ranges[key][0]} تا ${ranges[key][1]} باشد.`);
    document.getElementById("score_" + key).value = state.scoring[key];
    return;
  }
  state.scoring[key] = val;
  saveState();
};
window.resetScoringToDefault = function () {
  if (!confirm("مقادیر امتیازها به حالت پیش‌فرض برگردند؟")) return;
  state.scoring = { ...DEFAULT_STATE.scoring };
  saveState();
  buildScoringFields();
};

// ================== HELP MODAL ==================
window.openHelpModal = function () {
  const modal = document.getElementById("helpModal");
  if (!modal) return;
  modal.classList.add("active");
  document
    .querySelectorAll("#helpModal .tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector('#helpModal .tab-btn[data-tab="help-guide"]')
    .classList.add("active");
  document
    .querySelectorAll("#helpModal .tab-content")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById("tab-help-guide").classList.add("active");
  document.querySelectorAll("#helpModal .tab-btn").forEach((btn) => {
    btn.onclick = function () {
      document
        .querySelectorAll("#helpModal .tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      document
        .querySelectorAll("#helpModal .tab-content")
        .forEach((c) => c.classList.remove("active"));
      document
        .getElementById("tab-" + this.dataset.tab)
        .classList.add("active");
    };
  });
};
window.closeHelpModal = function () {
  document.getElementById("helpModal").classList.remove("active");
};

// ================== BACKGROUND ==================
window.applyBackground = function () {
  document.body.classList.remove("glass-theme", "custom-bg");
  document.body.style.backgroundImage = "";
  if (state.backgroundType === "glass") {
    document.body.classList.add("glass-theme");
  } else if (state.backgroundType === "custom" && state.backgroundImage) {
    document.body.classList.add("custom-bg");
    document.body.style.backgroundImage = `url(${state.backgroundImage})`;
  }
};
window.changeBackgroundType = function (value) {
  state.backgroundType = value;
  const uploadDiv = document.getElementById("customBgUpload");
  if (uploadDiv)
    uploadDiv.style.display = value === "custom" ? "block" : "none";
  applyBackground();
  saveState();
};
window.handleBgImageUpload = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    state.backgroundImage = e.target.result;
    state.backgroundType = "custom";
    const bgSelect = document.getElementById("bgTypeSelect");
    if (bgSelect) bgSelect.value = "custom";
    const uploadDiv = document.getElementById("customBgUpload");
    if (uploadDiv) uploadDiv.style.display = "block";
    const preview = document.getElementById("bgPreview");
    if (preview) {
      preview.style.backgroundImage = `url(${state.backgroundImage})`;
      preview.style.display = "block";
    }
    applyBackground();
    saveState();
  };
  reader.readAsDataURL(file);
};
window.removeBgImage = function () {
  state.backgroundImage = null;
  state.backgroundType = "default";
  const bgSelect = document.getElementById("bgTypeSelect");
  if (bgSelect) bgSelect.value = "default";
  const uploadDiv = document.getElementById("customBgUpload");
  if (uploadDiv) uploadDiv.style.display = "none";
  const preview = document.getElementById("bgPreview");
  if (preview) preview.style.display = "none";
  applyBackground();
  saveState();
};
window.refreshUI = function () {
  render();
};
// ================== INIT ==================
window.navigateTo = function (view) {
  clearInterval(pomodoroTimer);
  pomodoroRunning = false;
  currentView = view;
  render();
};
window.resetAllData = async function () {
  if (!confirm("ریست کامل؟ تمام داده‌ها و تنظیمات پاک خواهد شد.")) return;

  // بستن دیتابیس فعلی
  if (db) {
    db.close();
    db = null;
    dbReady = initDB(); // آماده‌سازی مجدد برای بارگذاری بعدی
  }

  try {
    // حذف Service Workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }

    // پاک کردن Cache Storage
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (e) {
    // اگر خطایی در پاک‌سازی SW یا Cache رخ داد، ادامه می‌دهیم
    console.warn("خطا در پاک‌سازی SW/Cache:", e);
  }

  // حذف IndexedDB به صورت تازه (با ایجاد یک اتصال جدید برای حذف)
  const deleteReq = indexedDB.deleteDatabase(DB_NAME);
  deleteReq.onsuccess = () => {
    // بعد از حذف کامل، رفرش سخت انجام بده
    window.location.reload(true);
  };
  deleteReq.onerror = () => {
    alert(
      "خطایی در حذف داده‌ها رخ داد. لطفاً همه تب‌های برنامه را ببندید و دوباره تلاش کنید.",
    );
  };
  deleteReq.onblocked = () => {
    alert(
      "پایگاه داده در حال استفاده است. لطفاً همه تب‌های باز برنامه را ببندید و دوباره امتحان کنید.",
    );
  };
};

(async function () {
  state = await loadState();
  const today = getTodayDateString();
  if (state.lastReset !== today) {
    state.habits.forEach((h) => (h.doneToday = false));
    state.waterCups = 0;
    state.dailyTasks = [];
    state.lastReset = today;
  }
  changeTheme(state.theme);
  applyBackground();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
  await saveState();
  await window.calculateTodayPoints();
  render();
})();
