// テンプレート管理ができるまでの初期データ
const TEMPLATES = [
  { name: "ゲーム課金", amount: 3000, category: "課金" },
  { name: "パチンコ・スロット", amount: 10000, category: "ギャンブル" },
  { name: "競馬・宝くじ", amount: 3000, category: "ギャンブル" },
  { name: "外食", amount: 1500, category: "外食" },
  { name: "デリバリー", amount: 2000, category: "外食" },
  { name: "飲み会の二次会", amount: 3000, category: "外食" },
  { name: "カフェ", amount: 500, category: "その他" },
  { name: "コンビニのついで買い", amount: 500, category: "その他" },
  { name: "ネット通販の衝動買い", amount: 3000, category: "その他" },
  { name: "お酒・タバコ", amount: 800, category: "その他" },
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

const DB_NAME = "gaman-chokin";
const STORE = "records";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function writeStore(db, action) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    action(tx.objectStore(STORE));
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

function getRecords(db) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
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

let editingRecord = null;
let newRecordType = "gaman";
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

function getStats(records) {
  const sumOf = (list) => list.reduce((sum, record) => sum + record.amount, 0);
  const gaman = records.filter((record) => !isSpent(record));
  // 経験値は「使っちゃった」では減らさない
  const exp = sumOf(gaman);
  const level = 1 + Math.floor(Math.sqrt(exp / LEVEL_UNIT));
  const lastTime = Math.max(0, ...records.map((record) => new Date(record.createdAt).getTime()));
  // 使いすぎた分を後の我慢に持ち越さないよう、古い順に計算して0円で止める
  const oldestFirst = [...records].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const balance = oldestFirst.reduce(
    (sum, record) => Math.max(0, sum + (isSpent(record) ? -record.amount : record.amount)),
    0,
  );
  return {
    balance,
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

async function render(db) {
  const records = await getRecords(db);
  stats = getStats(records);
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
}

function celebrate(amount, before) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  let message = `+${yen(amount)}! ${cheer}`;
  if (stats.stage.id !== before.stage.id) {
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

function openForm(record = null, type = "gaman") {
  editingRecord = record;
  newRecordType = type;
  const newTitle = type === "spent" ? "使っちゃったを記録" : "金額を入力して記録";
  formTitle.textContent = record ? "記録を修正" : newTitle;
  amountField.value = record ? record.amount : "";
  categoryField.value = record ? record.category : CATEGORIES[0];
  memoField.value = record?.memo ?? "";
  deleteButton.hidden = !record;
  resetDeleteButton();
  formSheet.showModal();
}

function showView(name) {
  const isHome = name === "home";
  document.getElementById("view-home").hidden = !isHome;
  document.getElementById("view-history").hidden = isHome;
  const homeTab = document.getElementById("tab-home");
  const historyTab = document.getElementById("tab-history");
  if (isHome) {
    homeTab.setAttribute("aria-current", "page");
    historyTab.removeAttribute("aria-current");
  } else {
    historyTab.setAttribute("aria-current", "page");
    homeTab.removeAttribute("aria-current");
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
    const name = document.createElement("span");
    name.textContent = template.name;
    const amount = document.createElement("b");
    amount.textContent = yen(template.amount);
    button.append(name, amount);
    button.addEventListener("click", async () => {
      await addRecord(db, {
        type: "gaman",
        name: template.name,
        amount: template.amount,
        category: template.category,
        createdAt: new Date().toISOString(),
      });
      sheet.close();
      const before = stats;
      await render(db);
      celebrate(template.amount, before);
    });
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

  document.getElementById("open-sheet").addEventListener("click", () => sheet.showModal());
  document.getElementById("close-sheet").addEventListener("click", () => sheet.close());
  document.getElementById("close-form").addEventListener("click", () => formSheet.close());
  document.getElementById("tab-home").addEventListener("click", () => showView("home"));
  document.getElementById("tab-history").addEventListener("click", () => showView("history"));
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
  if (stats.isLonely) {
    messageEl.textContent = WELCOME_BACK;
  }
}

start().catch((error) => {
  console.error(error);
  messageEl.textContent = "データを読み込めませんでした。ページを開き直してください。";
});
