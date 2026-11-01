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

function addRecord(db, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
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

async function render(db) {
  const records = await getRecords(db);
  const total = records.reduce((sum, record) => sum + record.amount, 0);
  totalEl.textContent = total.toLocaleString("ja-JP");
  countEl.textContent = records.length.toLocaleString("ja-JP");
}

function celebrate(template) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  messageEl.textContent = `+${template.amount.toLocaleString("ja-JP")}円! ${cheer}`;
  characterEl.classList.add("happy");
  setTimeout(() => characterEl.classList.remove("happy"), 300);
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
    amount.textContent = `${template.amount.toLocaleString("ja-JP")}円`;
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
      celebrate(template);
    });
    const item = document.createElement("li");
    item.append(button);
    templatesEl.append(item);
  }

  document.getElementById("open-sheet").addEventListener("click", () => sheet.showModal());
  document.getElementById("close-sheet").addEventListener("click", () => sheet.close());

  await render(db);
}

start().catch((error) => {
  console.error(error);
  messageEl.textContent = "データを読み込めませんでした。ページを開き直してください。";
});
