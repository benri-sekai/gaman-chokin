// テンプレート管理ができるまでの初期データ
const TEMPLATES = [
  { name: "ゲーム課金", amounts: [1000, 3000, 5000, 10000], category: "課金" },
  { name: "パチンコ・スロット", amounts: [3000, 5000, 10000, 30000], category: "ギャンブル" },
  { name: "競馬・宝くじ", amounts: [1000, 3000, 5000, 10000], category: "ギャンブル" },
  { name: "外食", amounts: [1000, 1500, 3000, 5000], category: "外食" },
  { name: "デリバリー", amounts: [1500, 2000, 3000, 5000], category: "外食" },
  { name: "飲み会の二次会", amounts: [3000, 5000, 8000, 10000], category: "外食" },
  { name: "カフェ", amounts: [300, 500, 800, 1000], category: "その他" },
  { name: "コンビニのついで買い", amounts: [300, 500, 1000, 2000], category: "その他" },
  { name: "ネット通販の衝動買い", amounts: [1000, 3000, 5000, 10000], category: "その他" },
  { name: "お酒・タバコ", amounts: [500, 800, 1000, 3000], category: "その他" },
];

const CATEGORIES = ["課金", "ギャンブル", "外食", "その他"];

const CHEERS = [
  "やったね、えらい!",
  "その調子だよ!",
  "我慢できたの、すごいよ!",
  "また一歩前進だね!",
];

const SPENT_THANKS = "教えてくれてありがとう。またがんばろう!";
const WELCOME_BACK = "ひさしぶり!また来てくれてうれしいよ";

// 進化に必要な累計額。実際に使いながら調整する
const STAGES = [
  { id: "egg", name: "たまご", minExp: 0 },
  { id: "child", name: "子ども", minExp: 5000 },
  { id: "adult", name: "大人", minExp: 30000 },
];
const LEVEL_UNIT = 500;
const SAD_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

// 貯金額に応じてアプリから提案する例
const SUGGESTIONS = [
  { name: "カフェでケーキセット", amount: 1000 },
  { name: "焼肉ランチ", amount: 3000 },
  { name: "映画を2回", amount: 5000 },
  { name: "ちょっといいディナー", amount: 10000 },
  { name: "温泉で1泊", amount: 30000 },
  { name: "国内旅行", amount: 50000 },
  { name: "ちょっと贅沢な国内旅行", amount: 100000 },
  { name: "海外旅行", amount: 200000 },
];
const VISIBLE_SUGGESTIONS = 3;

const BACKUP_APP_ID = "gaman-chokin";
const BACKUP_VERSION = 1;
const BACKUP_REMIND_MS = 30 * 24 * 60 * 60 * 1000;
const LAST_EXPORT_KEY = "lastExportAt";

const DB_NAME = "gaman-chokin";
const STORE = "records";
const GOAL_STORE = "goals";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event) => {
      // 既存の記録を残したまま、足りない保存先だけを作る
      if (event.oldVersion < 1) {
        request.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
      if (event.oldVersion < 2) {
        request.result.createObjectStore(GOAL_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    // 古い画面が閉じられると onsuccess に進むので、案内だけ出して待つ
    request.onblocked = () => {
      messageEl.textContent = "別のタブで開いているこのアプリを閉じてください";
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

function writeStore(db, action, storeName = STORE) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    action(tx.objectStore(storeName));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function addRecord(db, record) {
  return writeStore(db, (store) => store.add(record));
}

function updateRecord(db, record) {
  return writeStore(db, (store) => store.put(record));
}

function deleteRecord(db, id) {
  return writeStore(db, (store) => store.delete(id));
}

// 途中で失敗したら元のデータが残るよう、1回のトランザクションで置き換える
function replaceAllData(db, records, goals) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE, GOAL_STORE], "readwrite");
    const recordStore = tx.objectStore(STORE);
    const goalStore = tx.objectStore(GOAL_STORE);
    recordStore.clear();
    goalStore.clear();
    records.forEach((record) => recordStore.add(record));
    goals.forEach((goal) => goalStore.add(goal));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function getAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName).objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const totalEl = document.getElementById("total");
const countEl = document.getElementById("count");
const messageEl = document.getElementById("message");
const characterEl = document.getElementById("character");
const sheet = document.getElementById("sheet");
const templatesEl = document.getElementById("templates");
const recordsEl = document.getElementById("records");
const historyEmptyEl = document.getElementById("history-empty");
const formSheet = document.getElementById("form-sheet");
const formTitle = document.getElementById("form-title");
const amountField = document.getElementById("field-amount");
const categoryField = document.getElementById("field-category");
const memoField = document.getElementById("field-memo");
const deleteButton = document.getElementById("delete-record");
const goalSheet = document.getElementById("goal-sheet");
const goalNameField = document.getElementById("goal-name");
const goalAmountField = document.getElementById("goal-amount");
const deleteGoalButton = document.getElementById("delete-goal");

let editingRecord = null;
let editingGoal = null;
let latestRecords = [];
let latestGoals = [];
let pendingImport = null;
let newRecordType = "gaman";
let newRecordTemplate = null;
let stats = null;
let moodTimer = null;

function yen(amount) {
  return `${amount.toLocaleString("ja-JP")}円`;
}

function isSpent(record) {
  return record.type === "spent";
}

function levelStartExp(level) {
  return LEVEL_UNIT * (level - 1) ** 2;
}

// 記録から達成日を求める。貯金額が後で減っても、記録が残る限り達成のまま
function findAchievedTime(timeline, target, since) {
  let balanceAtStart = 0;
  for (const point of timeline) {
    if (point.time >= since) {
      if (balanceAtStart >= target) return since;
      if (point.balance >= target) return point.time;
    } else {
      balanceAtStart = point.balance;
    }
  }
  return balanceAtStart >= target ? since : null;
}

function getMilestones(timeline, goals) {
  const fromGoals = goals.map((goal) => ({
    key: `goal-${goal.id}`,
    goal,
    name: goal.name,
    amount: goal.amount,
    achievedTime: findAchievedTime(timeline, goal.amount, new Date(goal.createdAt).getTime()),
  }));
  const fromSuggestions = SUGGESTIONS.map((suggestion) => ({
    key: `suggestion-${suggestion.name}`,
    name: suggestion.name,
    amount: suggestion.amount,
    achievedTime: findAchievedTime(timeline, suggestion.amount, 0),
  }));
  return [...fromGoals, ...fromSuggestions];
}

function getStats(records, goals) {
  const sumOf = (list) => list.reduce((sum, record) => sum + record.amount, 0);
  const gaman = records.filter((record) => !isSpent(record));
  // 経験値は「使っちゃった」では減らさない
  const exp = sumOf(gaman);
  const level = 1 + Math.floor(Math.sqrt(exp / LEVEL_UNIT));
  const lastTime = Math.max(0, ...records.map((record) => new Date(record.createdAt).getTime()));
  // 使いすぎた分を後の我慢に持ち越さないよう、古い順に計算して0円で止める
  const oldestFirst = [...records].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let balance = 0;
  const timeline = oldestFirst.map((record) => {
    balance = Math.max(0, balance + (isSpent(record) ? -record.amount : record.amount));
    return { time: new Date(record.createdAt).getTime(), balance };
  });
  return {
    balance,
    milestones: getMilestones(timeline, goals),
    gamanCount: gaman.length,
    exp,
    level,
    stage: STAGES.filter((stage) => exp >= stage.minExp).pop(),
    isLonely: records.length > 0 && Date.now() - lastTime >= SAD_AFTER_MS,
  };
}

function formatDate(iso) {
  const date = new Date(iso);
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${minutes}`;
}

function renderHistory(records) {
  const newestFirst = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  historyEmptyEl.hidden = records.length > 0;
  recordsEl.replaceChildren(
    ...newestFirst.map((record) => {
      const title = document.createElement("span");
      title.className = "record-title";
      const label = record.name || record.category;
      title.textContent = isSpent(record) ? `使っちゃった(${label})` : label;
      const sub = document.createElement("span");
      sub.className = "record-sub";
      sub.textContent = [formatDate(record.createdAt), record.memo].filter(Boolean).join(" ・ ");
      const main = document.createElement("span");
      main.className = "record-main";
      main.append(title, sub);
      const amount = document.createElement("b");
      amount.textContent = isSpent(record) ? `−${yen(record.amount)}` : yen(record.amount);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "record";
      button.append(main, amount);
      button.addEventListener("click", () => openForm(record));
      const item = document.createElement("li");
      item.append(button);
      return item;
    }),
  );
}

function milestoneCard(milestone) {
  const name = document.createElement("span");
  name.className = "record-title";
  name.textContent = milestone.name;
  const amount = document.createElement("b");
  amount.textContent = yen(milestone.amount);
  const top = document.createElement("span");
  top.className = "milestone-top";
  top.append(name, amount);
  const sub = document.createElement("span");
  sub.className = "record-sub";
  const isAchieved = milestone.achievedTime !== null;
  sub.textContent = isAchieved
    ? `達成! ${formatDate(milestone.achievedTime).split(" ")[0]}`
    : `あと${yen(milestone.amount - stats.balance)}`;
  const card = document.createElement(milestone.goal ? "button" : "div");
  card.className = "milestone";
  card.append(top);
  if (!isAchieved) {
    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.width = `${(stats.balance / milestone.amount) * 100}%`;
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.append(fill);
    card.append(bar);
  }
  card.append(sub);
  if (milestone.goal) {
    card.type = "button";
    card.addEventListener("click", () => openGoalForm(milestone.goal));
  }
  const item = document.createElement("li");
  item.append(card);
  return item;
}

function renderMilestones() {
  const byAmount = (a, b) => a.amount - b.amount;
  const pending = stats.milestones.filter((milestone) => milestone.achievedTime === null).sort(byAmount);
  const achieved = stats.milestones
    .filter((milestone) => milestone.achievedTime !== null)
    .sort((a, b) => b.achievedTime - a.achievedTime || b.amount - a.amount);
  const pendingGoals = pending.filter((milestone) => milestone.goal);
  const pendingSuggestions = pending.filter((milestone) => !milestone.goal);

  const goalsEl = document.getElementById("goals");
  goalsEl.replaceChildren(...pendingGoals.map(milestoneCard));
  document.getElementById("goals-empty").hidden = pendingGoals.length > 0;
  document
    .getElementById("suggestions")
    .replaceChildren(...pendingSuggestions.slice(0, VISIBLE_SUGGESTIONS).map(milestoneCard));
  document.getElementById("suggestions-section").hidden = pendingSuggestions.length === 0;
  document.getElementById("achieved").replaceChildren(...achieved.map(milestoneCard));
  document.getElementById("achieved-section").hidden = achieved.length === 0;

  // ホームには、自分の目標を優先して次の1件を出す
  const next = pendingGoals[0] ?? pendingSuggestions[0];
  const nextEl = document.getElementById("next-milestone");
  nextEl.hidden = !next;
  if (next) {
    nextEl.textContent = `次の目標:${next.name} あと${yen(next.amount - stats.balance)}`;
  }
}

function getLastExportTime() {
  try {
    const value = localStorage.getItem(LAST_EXPORT_KEY);
    return value ? new Date(value).getTime() : null;
  } catch {
    return null;
  }
}

function renderBackupStatus() {
  const lastExport = getLastExportTime();
  document.getElementById("last-export").textContent = lastExport
    ? `最後の書き出し:${formatDate(lastExport)}`
    : "まだ書き出していません";
  const oldest = Math.min(...latestRecords.map((record) => new Date(record.createdAt).getTime()));
  const since = lastExport ?? oldest;
  document.getElementById("backup-hint").hidden =
    latestRecords.length === 0 || Date.now() - since < BACKUP_REMIND_MS;
}

function backupFileName() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `gaman-chokin-backup-${now.getFullYear()}-${month}-${day}.json`;
}

function setBackupStatus(text) {
  document.getElementById("backup-status").textContent = text;
}

function markExported() {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
  } catch {
    // 保存できなくても書き出し自体は成功している
  }
  renderBackupStatus();
}

// iPhoneは共有シートから「ファイルに保存」する。共有できない環境はダウンロードにする
async function exportBackup() {
  const body = JSON.stringify(
    {
      app: BACKUP_APP_ID,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      records: latestRecords,
      goals: latestGoals,
    },
    null,
    2,
  );
  const file = new File([body], backupFileName(), { type: "application/json" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (error) {
      if (error.name !== "AbortError") {
        setBackupStatus("書き出せませんでした。もう一度お試しください。");
      }
      return;
    }
  } else {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  markExported();
  setBackupStatus(`${latestRecords.length}件の記録と${latestGoals.length}件の目標を書き出しました。`);
}

function isValidDate(value) {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function isValidAmount(value) {
  return Number.isSafeInteger(value) && value > 0;
}

// 不正なファイルで記録を壊さないよう、すべて確認してから必要な項目だけ取り出す
function parseBackup(text) {
  const data = JSON.parse(text);
  if (data?.app !== BACKUP_APP_ID || !Array.isArray(data.records) || !Array.isArray(data.goals)) {
    throw new Error("not a backup");
  }
  if (data.version > BACKUP_VERSION) {
    throw new Error("newer backup");
  }
  const records = data.records.map((record) => {
    const isValid =
      (record?.type === "gaman" || record?.type === "spent") &&
      isValidAmount(record.amount) &&
      typeof record.category === "string" &&
      isValidDate(record.createdAt);
    if (!isValid) throw new Error("invalid record");
    return {
      type: record.type,
      amount: record.amount,
      category: record.category,
      createdAt: record.createdAt,
      ...(typeof record.name === "string" && { name: record.name }),
      ...(typeof record.memo === "string" && { memo: record.memo }),
    };
  });
  const goals = data.goals.map((goal) => {
    const isValid =
      typeof goal?.name === "string" &&
      goal.name.trim() !== "" &&
      isValidAmount(goal.amount) &&
      isValidDate(goal.createdAt);
    if (!isValid) throw new Error("invalid goal");
    return { name: goal.name, amount: goal.amount, createdAt: goal.createdAt };
  });
  return { records, goals, exportedAt: isValidDate(data.exportedAt) ? data.exportedAt : null };
}

function clearPendingImport() {
  pendingImport = null;
  document.getElementById("import-confirm").hidden = true;
}

async function chooseImportFile(input) {
  const file = input.files[0];
  // 同じファイルをもう一度選べるようにする
  input.value = "";
  if (!file) return;
  clearPendingImport();
  try {
    pendingImport = parseBackup(await file.text());
  } catch {
    setBackupStatus("このファイルは読み込めませんでした。今のデータは変更していません。");
    return;
  }
  const date = pendingImport.exportedAt ? formatDate(pendingImport.exportedAt) : "不明";
  document.getElementById("import-summary").textContent =
    `書き出し日:${date}、記録${pendingImport.records.length}件、目標${pendingImport.goals.length}件。` +
    `今の記録${latestRecords.length}件と目標${latestGoals.length}件は、この内容に置き換わります。`;
  document.getElementById("import-confirm").hidden = false;
  setBackupStatus("");
}

async function render(db) {
  const [records, goals] = await Promise.all([getAll(db, STORE), getAll(db, GOAL_STORE)]);
  latestRecords = records;
  latestGoals = goals;
  stats = getStats(records, goals);
  renderBackupStatus();
  totalEl.textContent = stats.balance.toLocaleString("ja-JP");
  countEl.textContent = stats.gamanCount.toLocaleString("ja-JP");
  document.getElementById("cumulative").textContent = stats.exp.toLocaleString("ja-JP");
  document.getElementById("stage").textContent = stats.stage.name;
  document.getElementById("level").textContent = stats.level;
  const start = levelStartExp(stats.level);
  const next = levelStartExp(stats.level + 1);
  document.getElementById("level-bar").style.width = `${((stats.exp - start) / (next - start)) * 100}%`;
  document.getElementById("next-level").textContent = (next - stats.exp).toLocaleString("ja-JP");
  characterEl.dataset.stage = stats.stage.id;
  clearTimeout(moodTimer);
  characterEl.dataset.mood = stats.isLonely ? "sad" : "normal";
  renderHistory(records);
  renderMilestones();
}

function celebrate(amount, before) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  let message = `+${yen(amount)}! ${cheer}`;
  const wasAchieved = new Set(
    before.milestones.filter((milestone) => milestone.achievedTime !== null).map((milestone) => milestone.key),
  );
  const newlyAchieved = stats.milestones
    .filter((milestone) => milestone.achievedTime !== null && !wasAchieved.has(milestone.key))
    .sort((a, b) => b.amount - a.amount);
  if (newlyAchieved.length > 0) {
    message = `+${yen(amount)}! 「${newlyAchieved[0].name}」を達成!`;
  } else if (stats.stage.id !== before.stage.id) {
    message = `+${yen(amount)}! ${stats.stage.name}に進化したよ!`;
  } else if (stats.level > before.level) {
    message = `+${yen(amount)}! Lv.${stats.level}にレベルアップ!`;
  }
  messageEl.textContent = message;
  characterEl.dataset.mood = "happy";
  moodTimer = setTimeout(() => {
    characterEl.dataset.mood = "normal";
  }, 1500);
}

function resetDeleteButton() {
  deleteButton.textContent = "この記録を削除";
  delete deleteButton.dataset.armed;
}

function openForm(record = null, type = "gaman", template = null) {
  editingRecord = record;
  newRecordType = type;
  newRecordTemplate = template;
  const newTitle = type === "spent" ? "使っちゃったを記録" : "金額を入力して記録";
  formTitle.textContent = record ? "記録を修正" : template?.name ?? newTitle;
  amountField.value = record ? record.amount : "";
  categoryField.value = record?.category ?? template?.category ?? CATEGORIES[0];
  memoField.value = record?.memo ?? "";
  deleteButton.hidden = !record;
  resetDeleteButton();
  formSheet.showModal();
}

function resetDeleteGoalButton() {
  deleteGoalButton.textContent = "この目標を削除";
  delete deleteGoalButton.dataset.armed;
}

function openGoalForm(goal = null) {
  editingGoal = goal;
  document.getElementById("goal-title").textContent = goal ? "目標を修正" : "目標を追加";
  goalNameField.value = goal ? goal.name : "";
  goalAmountField.value = goal ? goal.amount : "";
  deleteGoalButton.hidden = !goal;
  resetDeleteGoalButton();
  goalSheet.showModal();
}

function showItemStep() {
  document.getElementById("sheet-title").textContent = "何を我慢した?";
  document.getElementById("item-step").hidden = false;
  document.getElementById("amount-step").hidden = true;
}

function showAmountStep(db, template) {
  document.getElementById("sheet-title").textContent = template.name;
  document.getElementById("item-step").hidden = true;
  document.getElementById("amount-step").hidden = false;
  document.getElementById("amount-options").replaceChildren(
    ...template.amounts.map((amount) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "amount-option";
      button.textContent = yen(amount);
      button.addEventListener("click", async () => {
        await addRecord(db, {
          type: "gaman",
          name: template.name,
          amount,
          category: template.category,
          createdAt: new Date().toISOString(),
        });
        sheet.close();
        const before = stats;
        await render(db);
        celebrate(amount, before);
      });
      return button;
    }),
  );
  document.getElementById("amount-custom").onclick = () => {
    sheet.close();
    openForm(null, "gaman", template);
  };
}

function showView(name) {
  for (const view of ["home", "history", "milestones", "settings"]) {
    const isCurrent = view === name;
    document.getElementById(`view-${view}`).hidden = !isCurrent;
    const tab = document.getElementById(`tab-${view}`);
    if (isCurrent) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  }
  window.scrollTo(0, 0);
}

async function start() {
  const db = await openDb();
  // ブラウザにデータを消されにくくする(非対応の環境では何もしない)
  navigator.storage?.persist?.();

  for (const template of TEMPLATES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "template";
    button.textContent = template.name;
    button.addEventListener("click", () => showAmountStep(db, template));
    const item = document.createElement("li");
    item.append(button);
    templatesEl.append(item);
  }

  for (const category of CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryField.append(option);
  }

  document.getElementById("open-sheet").addEventListener("click", () => {
    showItemStep();
    sheet.showModal();
  });
  document.getElementById("back-to-items").addEventListener("click", showItemStep);
  document.getElementById("close-sheet").addEventListener("click", () => sheet.close());
  document.getElementById("close-form").addEventListener("click", () => formSheet.close());
  document.getElementById("tab-home").addEventListener("click", () => showView("home"));
  document.getElementById("tab-history").addEventListener("click", () => showView("history"));
  document.getElementById("tab-milestones").addEventListener("click", () => showView("milestones"));
  document.getElementById("tab-settings").addEventListener("click", () => showView("settings"));
  document.getElementById("backup-hint").addEventListener("click", () => showView("settings"));
  document.getElementById("export-data").addEventListener("click", exportBackup);
  document.getElementById("import-file").addEventListener("change", (event) => chooseImportFile(event.target));
  document.getElementById("import-cancel").addEventListener("click", clearPendingImport);
  document.getElementById("import-apply").addEventListener("click", async () => {
    try {
      await replaceAllData(db, pendingImport.records, pendingImport.goals);
    } catch {
      setBackupStatus("読み込めませんでした。今のデータは変更していません。");
      return;
    }
    clearPendingImport();
    await render(db);
    setBackupStatus(`${latestRecords.length}件の記録と${latestGoals.length}件の目標を復元しました。`);
  });
  document.getElementById("open-goal").addEventListener("click", () => openGoalForm());
  document.getElementById("close-goal").addEventListener("click", () => goalSheet.close());

  document.getElementById("goal-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = goalNameField.value.trim();
    if (!name) {
      goalNameField.value = "";
      goalNameField.reportValidity();
      return;
    }
    const amount = Number(goalAmountField.value);
    await writeStore(
      db,
      (store) => {
        if (editingGoal) {
          store.put({ ...editingGoal, name, amount });
        } else {
          store.add({ name, amount, createdAt: new Date().toISOString() });
        }
      },
      GOAL_STORE,
    );
    goalSheet.close();
    await render(db);
  });

  deleteGoalButton.addEventListener("click", async () => {
    if (!deleteGoalButton.dataset.armed) {
      deleteGoalButton.dataset.armed = "true";
      deleteGoalButton.textContent = "もう一度押すと削除します";
      return;
    }
    await writeStore(db, (store) => store.delete(editingGoal.id), GOAL_STORE);
    goalSheet.close();
    await render(db);
  });
  document.getElementById("open-manual").addEventListener("click", () => {
    sheet.close();
    openForm();
  });
  document.getElementById("open-spent").addEventListener("click", () => openForm(null, "spent"));

  document.getElementById("record-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = Number(amountField.value);
    const memo = memoField.value.trim();
    const before = stats;
    const isNew = !editingRecord;
    if (isNew) {
      await addRecord(db, {
        type: newRecordType,
        ...(newRecordTemplate && { name: newRecordTemplate.name }),
        amount,
        category: categoryField.value,
        memo,
        createdAt: new Date().toISOString(),
      });
    } else {
      await updateRecord(db, { ...editingRecord, amount, category: categoryField.value, memo });
    }
    formSheet.close();
    await render(db);
    if (isNew && newRecordType === "spent") {
      messageEl.textContent = SPENT_THANKS;
    } else if (isNew) {
      celebrate(amount, before);
    }
  });

  // 誤操作を防ぐため、2回押すと削除する
  deleteButton.addEventListener("click", async () => {
    if (!deleteButton.dataset.armed) {
      deleteButton.dataset.armed = "true";
      deleteButton.textContent = "もう一度押すと削除します";
      return;
    }
    await deleteRecord(db, editingRecord.id);
    formSheet.close();
    await render(db);
  });

  await render(db);
  messageEl.textContent = stats.isLonely ? WELCOME_BACK : "今日もよく来てくれたね!";
}

start().catch((error) => {
  console.error(error);
  messageEl.textContent = "データを読み込めませんでした。ページを開き直してください。";
});
