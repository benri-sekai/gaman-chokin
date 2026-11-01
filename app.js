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
const characterEl = document.querySelector(".character");
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

function yen(amount) {
  return `${amount.toLocaleString("ja-JP")}円`;
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
      title.textContent = record.name || record.category;
      const sub = document.createElement("span");
      sub.className = "record-sub";
      sub.textContent = [formatDate(record.createdAt), record.memo].filter(Boolean).join(" ・ ");
      const main = document.createElement("span");
      main.className = "record-main";
      main.append(title, sub);
      const amount = document.createElement("b");
      amount.textContent = yen(record.amount);
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
  const total = records.reduce((sum, record) => sum + record.amount, 0);
  totalEl.textContent = total.toLocaleString("ja-JP");
  countEl.textContent = records.length.toLocaleString("ja-JP");
  renderHistory(records);
}

function celebrate(amount) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  messageEl.textContent = `+${yen(amount)}! ${cheer}`;
  characterEl.classList.add("happy");
  setTimeout(() => characterEl.classList.remove("happy"), 300);
}

function resetDeleteButton() {
  deleteButton.textContent = "この記録を削除";
  delete deleteButton.dataset.armed;
}

function openForm(record = null) {
  editingRecord = record;
  formTitle.textContent = record ? "記録を修正" : "金額を入力して記録";
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
      await render(db);
      celebrate(template.amount);
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

  document.getElementById("record-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = Number(amountField.value);
    const memo = memoField.value.trim();
    if (editingRecord) {
      await updateRecord(db, { ...editingRecord, amount, category: categoryField.value, memo });
    } else {
      await addRecord(db, {
        type: "gaman",
        amount,
        category: categoryField.value,
        memo,
        createdAt: new Date().toISOString(),
      });
      celebrate(amount);
    }
    formSheet.close();
    await render(db);
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
}

start().catch((error) => {
  console.error(error);
  messageEl.textContent = "データを読み込めませんでした。ページを開き直してください。";
});
