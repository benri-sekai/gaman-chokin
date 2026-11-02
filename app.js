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
  { id: "egg", name: "はじまり", minExp: 0 },
  { id: "baby", name: "誕生", minExp: 5000, image: 1 },
  { id: "child", name: "進化1", minExp: 20000, image: 2 },
  { id: "adult", name: "最終進化", minExp: 50000, image: 3 },
];
// 次のたまごを迎えた日時の一覧。その後の我慢だけで新しいキャラが育つ
const EGG_STARTS_KEY = "eggStarts";
// キャラごとに育てきった回数。図鑑と同じくリセットしても残す
const RAISED_KEY = "raised";
// 次のたまごで避ける属性(前のキャラの属性)
const AVOID_TYPE_KEY = "avoidType";
const BACKGROUND_KEY = "background";
// 見た目は style.css の [data-bg] で決める。color はスマホ上部のバーの色
const BACKGROUNDS = [
  { id: "cream", name: "クリーム", color: "#fff8ee" },
  { id: "sakura", name: "さくら", color: "#fdeef1" },
  { id: "sora", name: "そら", color: "#e9f3fb" },
  { id: "wakaba", name: "わかば", color: "#edf6e6" },
  { id: "lavender", name: "ラベンダー", color: "#f1edf9" },
  { id: "lemon", name: "レモン", color: "#fdf8dc" },
  { id: "dots", name: "水玉", color: "#fff8ee" },
  { id: "stripe", name: "ストライプ", color: "#fdeef1" },
  { id: "gingham", name: "ギンガム", color: "#f4f9fd" },
  { id: "grid", name: "方眼", color: "#f7fbf3" },
  { id: "stars", name: "ほし", color: "#f1edf9" },
];
const EGG = {
  id: "egg",
  name: "コツコツのたまご",
  text: "「今日は買わずにおこう」と決めたとき、小さな力が殻に宿る。中で眠るのは、あなたの選択を栄養に育つ生きもの。どんな未来が生まれるか、まだ誰も知らない。",
};
// たまごから生まれるタイプ。最初の我慢の記録をもとにランダムで決まる。
// 並び順を変えると今のキャラのタイプが変わるので、図鑑の順は ZUKAN_ORDER で決める
const TYPES = [
  {
    id: "fire",
    name: "炎属性",
    theme: "衝動が、未来へ進む力になる",
    characters: [
      {
        name: "ヒポロ",
        text: "「ほしい!」という気持ちから生まれた、小さな火の子。すぐ飛びつきそうになるけれど、一呼吸おけた日は得意顔。消さずにとっておいた熱が、成長の力になる。",
      },
      {
        name: "カケビ",
        text: "目の前の誘惑を追いかけるより、自分で決めたゴールへ走るのが好きになった。見送った買いものの分だけ、しっぽの炎が長く伸びる。ときどき振り返るが、足は止めない。",
      },
      {
        name: "エンガオウ",
        text: "燃え上がる気持ちを、自分の意志で使えるようになった姿。大きなたてがみは、未来のために選んできた日々の証。「ここぞ」というときには、貯めた力を惜しまず使う。",
      },
    ],
  },
  {
    id: "leaf",
    name: "森属性",
    theme: "小さな積み重ねが、実りになる",
    characters: [
      {
        name: "タネモチ",
        text: "未来の楽しみを、おなかの種にしまっている。ひとつ我慢できるたび、頭の芽がほんの少し伸びるらしい。昨日との違いは、本人にもまだ分からない。",
      },
      {
        name: "コノリス",
        text: "今ほしいものと、これから叶えたいことを見比べるようになった。選び取った未来を、枝のしっぽに結んで歩く。小さな積み重ねほど、決して落とさない。",
      },
      {
        name: "オオミノリ",
        text: "こつこつ貯めた力が、背中の大樹に金色の実をつけた。その木陰は、頑張ってきた持ち主がひと休みする場所。実をひとつ味わっても、育てた根っこはなくならない。",
      },
    ],
  },
  {
    id: "water",
    name: "水属性",
    theme: "ひと呼吸が、自分のペースをつくる",
    characters: [
      {
        name: "ポタネ",
        text: "ほしいものを見つけると、ぷるぷる揺れて迷いはじめる。少し待ってから決められた日は、体に小さなしずくが増える。急がなくても育つことを、まだ知らない。",
      },
      {
        name: "ユルカワ",
        text: "誘惑の波を、すいっと受け流すのが得意。人のペースには流されず、自分に必要なものをのんびり選ぶ。何も買わなかった日も、ちゃんと前へ進んでいる。",
      },
      {
        name: "ナミヌシ",
        text: "一滴ずつ貯めた力で、大きな流れをつくる水龍。迷った日も立ち止まった日も、長い川の一部として覚えている。持ち主がまた始めようと思ったら、静かに隣を泳ぎだす。",
      },
    ],
  },
];
const ZUKAN_ORDER = ["leaf", "fire", "water"];
const ZUKAN_KEY = "zukan";
const CHARACTER_IDS = ["egg", ...TYPES.flatMap((type) => [1, 2, 3].map((image) => `${type.id}-${image}`))];
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
const BACKUP_VERSION = 2;
const BACKUP_REMIND_MS = 30 * 24 * 60 * 60 * 1000;
const LAST_EXPORT_KEY = "lastExportAt";

const DB_NAME = "gaman-chokin";
const STORE = "records";
const GOAL_STORE = "goals";
const WISH_STORE = "wishes";

const CHART_PLOT = { left: 36, right: 328, top: 10, bottom: 146 };

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);
    request.onupgradeneeded = (event) => {
      // 既存の記録を残したまま、足りない保存先だけを作る
      if (event.oldVersion < 1) {
        request.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
      if (event.oldVersion < 2) {
        request.result.createObjectStore(GOAL_STORE, { keyPath: "id", autoIncrement: true });
      }
      if (event.oldVersion < 3) {
        request.result.createObjectStore(WISH_STORE, { keyPath: "id", autoIncrement: true });
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
function replaceAllData(db, records, goals, wishes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE, GOAL_STORE, WISH_STORE], "readwrite");
    const recordStore = tx.objectStore(STORE);
    const goalStore = tx.objectStore(GOAL_STORE);
    const wishStore = tx.objectStore(WISH_STORE);
    recordStore.clear();
    goalStore.clear();
    wishStore.clear();
    records.forEach((record) => recordStore.add(record));
    goals.forEach((goal) => goalStore.add(goal));
    wishes.forEach((wish) => wishStore.add(wish));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// 購入の記録とリストの更新は、片方だけ残らないよう同時に保存する
function purchaseWish(db, wish) {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    const tx = db.transaction([STORE, WISH_STORE], "readwrite");
    tx.objectStore(STORE).add({
      type: "purchase",
      name: wish.name,
      amount: wish.price,
      category: "その他",
      memo: "",
      createdAt: now,
    });
    tx.objectStore(WISH_STORE).put({ ...wish, purchasedAt: now });
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
const wishSheet = document.getElementById("wish-sheet");
const wishNameField = document.getElementById("wish-name");
const wishPriceField = document.getElementById("wish-price");
const wishMemoField = document.getElementById("wish-memo");
const buyWishButton = document.getElementById("buy-wish");
const deleteWishButton = document.getElementById("delete-wish");
const chartEl = document.getElementById("chart");
const chartReadout = document.getElementById("chart-readout");

let editingRecord = null;
let editingGoal = null;
let latestRecords = [];
let latestGoals = [];
let latestWishes = [];
let pendingImport = null;
let editingWish = null;
let chartRangeDays = 30;
let chartDays = [];
let chartScaleMax = 1;
let newRecordType = "gaman";
let newRecordTemplate = null;
let stats = null;
let moodTimer = null;

function yen(amount) {
  return `${amount.toLocaleString("ja-JP")}円`;
}

function isSpent(record) {
  return record.type === "spent" || record.type === "purchase";
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

// 保存しなくても毎回同じ結果になるよう、最初の我慢の日時から決める。
// リセットすると最初の記録が変わり、次のたまごはまたランダムになる
// avoid には前のキャラの属性が入り、同じ属性が続けて生まれないようにする
function pickType(gaman, avoid) {
  const first = gaman.reduce((oldest, record) => (oldest && oldest <= record.createdAt ? oldest : record.createdAt), "");
  let hash = 0;
  for (const char of first) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const candidates = TYPES.filter((type) => type.id !== avoid);
  return candidates[hash % candidates.length];
}

function loadAvoidType() {
  const value = readStorage(AVOID_TYPE_KEY, null);
  return TYPES.some((type) => type.id === value) ? value : null;
}

// たまごに戻すときに呼ぶ。まだ生まれていなければ、前に決めた属性をそのまま避ける
function rememberCurrentType() {
  if (stats.stage.image) writeStorage(AVOID_TYPE_KEY, stats.type.id);
}

function characterName(stats) {
  return stats.stage.image ? stats.type.characters[stats.stage.image - 1].name : EGG.name;
}

function characterImage(stats) {
  return stats.stage.image ? `chara/${stats.type.id}-${stats.stage.image}.png` : "chara/egg.png";
}

// 今のキャラと、その前の姿は出会ったことにする
function reachedCharacterIds(stats) {
  const ids = ["egg"];
  for (let image = 1; image <= (stats.stage.image ?? 0); image += 1) {
    ids.push(`${stats.type.id}-${image}`);
  }
  return ids;
}

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存できない環境では、今の画面の表示だけになる
  }
}

function loadBackground() {
  const value = readStorage(BACKGROUND_KEY, null);
  return BACKGROUNDS.some((background) => background.id === value) ? value : "cream";
}

function applyBackground(id) {
  const background = BACKGROUNDS.find((candidate) => candidate.id === id) ?? BACKGROUNDS[0];
  document.documentElement.dataset.bg = background.id;
  document.querySelector('meta[name="theme-color"]').content = background.color;
  writeStorage(BACKGROUND_KEY, background.id);
  for (const button of document.querySelectorAll(".bg-option")) {
    button.setAttribute("aria-pressed", button.dataset.option === background.id);
  }
}

function renderBackgroundOptions() {
  document.getElementById("backgrounds").replaceChildren(
    ...BACKGROUNDS.map((background) => {
      const swatch = document.createElement("span");
      swatch.className = "bg-swatch";
      swatch.dataset.bg = background.id;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bg-option";
      button.dataset.option = background.id;
      button.append(swatch, background.name);
      button.addEventListener("click", () => applyBackground(background.id));
      const item = document.createElement("li");
      item.append(button);
      return item;
    }),
  );
  applyBackground(loadBackground());
}

function loadEggStarts() {
  const value = readStorage(EGG_STARTS_KEY, []);
  return Array.isArray(value) ? value.filter(isValidDate).sort() : [];
}

function loadRaised() {
  const value = readStorage(RAISED_KEY, {});
  const raised = {};
  for (const id of CHARACTER_IDS) {
    if (Number.isSafeInteger(value?.[id]) && value[id] > 0) raised[id] = value[id];
  }
  return raised;
}

// 同じファイルを何度復元しても増えすぎないよう、多いほうの回数を残す
function mergeRaised(other) {
  const raised = loadRaised();
  for (const [id, count] of Object.entries(other)) {
    raised[id] = Math.max(raised[id] ?? 0, count);
  }
  writeStorage(RAISED_KEY, raised);
}

// 図鑑はリセットしても残したいので、記録とは別に保存する
function loadDiscovered() {
  try {
    const value = JSON.parse(localStorage.getItem(ZUKAN_KEY));
    return new Set(Array.isArray(value) ? value.filter((id) => CHARACTER_IDS.includes(id)) : []);
  } catch {
    return new Set();
  }
}

function addDiscovered(ids) {
  const discovered = loadDiscovered();
  const before = discovered.size;
  for (const id of ids) {
    if (CHARACTER_IDS.includes(id)) discovered.add(id);
  }
  if (discovered.size !== before) {
    try {
      localStorage.setItem(ZUKAN_KEY, JSON.stringify([...discovered]));
    } catch {
      // 保存できなくても、今の姿は毎回図鑑に載る
    }
  }
  return discovered;
}

function getStats(records, goals) {
  const sumOf = (list) => list.reduce((sum, record) => sum + record.amount, 0);
  const gaman = records.filter((record) => !isSpent(record));
  // 経験値は「使っちゃった」では減らさない
  const exp = sumOf(gaman);
  // 今のキャラは、最後にたまごを迎えた後の我慢だけで育つ
  const eggStart = loadEggStarts().at(-1) ?? "";
  const ownGaman = gaman.filter((record) => record.createdAt > eggStart);
  const characterExp = sumOf(ownGaman);
  const level = 1 + Math.floor(Math.sqrt(characterExp / LEVEL_UNIT));
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
    timeline,
    milestones: getMilestones(timeline, goals),
    gamanCount: gaman.length,
    exp,
    characterExp,
    level,
    stage: STAGES.filter((stage) => characterExp >= stage.minExp).pop(),
    type: pickType(ownGaman, loadAvoidType()),
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
      if (record.type === "purchase") {
        title.textContent = `買った(${label})`;
      } else {
        title.textContent = isSpent(record) ? `使っちゃった(${label})` : label;
      }
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

// 1日ごとの「その日の終わりの貯金額」を求める。始まりが分かるよう、最初の記録の前日(0円)から描く
function getChartDays(timeline, rangeDays) {
  if (timeline.length === 0) return [];
  const startOfDay = (time) => {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  const shiftDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const today = startOfDay(Date.now());
  const beforeFirst = shiftDays(startOfDay(timeline[0].time), -1);
  const rangeStart = shiftDays(today, -(rangeDays - 1));
  const start = rangeDays > 0 && rangeStart > beforeFirst ? rangeStart : beforeFirst;
  const days = [];
  let next = 0;
  let balance = 0;
  for (let day = start; day <= today; day = shiftDays(day, 1)) {
    const dayEnd = shiftDays(day, 1).getTime();
    while (next < timeline.length && timeline[next].time < dayEnd) {
      balance = timeline[next].balance;
      next += 1;
    }
    days.push({ date: day, balance });
  }
  return days;
}

function niceMax(value) {
  if (value <= 0) return 1000;
  const unit = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / unit) * unit;
}

function compactYen(amount) {
  return amount >= 10000 ? `${amount / 10000}万` : amount.toLocaleString("ja-JP");
}

function chartX(index) {
  const { left, right } = CHART_PLOT;
  return left + (index / Math.max(1, chartDays.length - 1)) * (right - left);
}

function chartY(amount) {
  const { top, bottom } = CHART_PLOT;
  return bottom - (amount / chartScaleMax) * (bottom - top);
}

function svgElement(name, attributes, text) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  if (text !== undefined) element.textContent = text;
  return element;
}

function showChartReadout(day) {
  const value = document.createElement("b");
  value.textContent = yen(day.balance);
  chartReadout.replaceChildren(value, `${day.date.getMonth() + 1}/${day.date.getDate()}`);
}

function moveChartCursor(index) {
  const x = chartX(index);
  const day = chartDays[index];
  const cursor = document.getElementById("chart-cursor");
  cursor.setAttribute("visibility", "visible");
  const line = cursor.querySelector("line");
  line.setAttribute("x1", x);
  line.setAttribute("x2", x);
  const dot = cursor.querySelector("circle");
  dot.setAttribute("cx", x);
  dot.setAttribute("cy", chartY(day.balance));
  showChartReadout(day);
}

function hideChartCursor() {
  document.getElementById("chart-cursor")?.setAttribute("visibility", "hidden");
  if (chartDays.length > 0) showChartReadout(chartDays[chartDays.length - 1]);
}

function renderChart() {
  chartDays = getChartDays(stats.timeline, chartRangeDays);
  chartEl.closest(".chart-card").hidden = chartDays.length === 0;
  chartEl.replaceChildren();
  if (chartDays.length === 0) return;
  const { left, right, top, bottom } = CHART_PLOT;
  chartScaleMax = niceMax(Math.max(...chartDays.map((day) => day.balance)));
  for (const tick of [0, chartScaleMax / 2, chartScaleMax]) {
    const y = chartY(tick);
    chartEl.append(
      svgElement("line", { class: "grid", x1: left, x2: right, y1: y, y2: y }),
      svgElement("text", { x: left - 6, y: y + 4, "text-anchor": "end" }, compactYen(tick)),
    );
  }
  const label = (day) => `${day.date.getMonth() + 1}/${day.date.getDate()}`;
  chartEl.append(
    svgElement("text", { x: left, y: bottom + 18 }, label(chartDays[0])),
    svgElement("text", { x: right, y: bottom + 18, "text-anchor": "end" }, label(chartDays[chartDays.length - 1])),
    svgElement("polyline", {
      class: "line",
      points: chartDays.map((day, index) => `${chartX(index)},${chartY(day.balance)}`).join(" "),
    }),
  );
  const last = chartDays[chartDays.length - 1];
  chartEl.append(
    svgElement("circle", { class: "dot", cx: right, cy: chartY(last.balance), r: 5 }),
  );
  const cursor = svgElement("g", { id: "chart-cursor", visibility: "hidden" });
  cursor.append(
    svgElement("line", { class: "crosshair", y1: top, y2: bottom }),
    svgElement("circle", { class: "dot", r: 5 }),
  );
  chartEl.append(cursor);
  chartEl.setAttribute(
    "aria-label",
    `貯金額の推移。${label(chartDays[0])}から${label(last)}まで。現在${yen(last.balance)}。各記録は下の履歴で確認できます。`,
  );
  showChartReadout(last);
}

function handleChartPointer(event) {
  if (chartDays.length === 0) return;
  const rect = chartEl.getBoundingClientRect();
  const { left, right } = CHART_PLOT;
  const x = ((event.clientX - rect.left) / rect.width) * 340;
  const ratio = Math.min(1, Math.max(0, (x - left) / (right - left)));
  moveChartCursor(Math.round(ratio * (chartDays.length - 1)));
}

function wishCard(wish) {
  const isPurchased = Boolean(wish.purchasedAt);
  const isAffordable = stats.balance >= wish.price;
  const name = document.createElement("span");
  name.className = "record-title";
  name.textContent = wish.name;
  const price = document.createElement("b");
  price.textContent = yen(wish.price);
  const top = document.createElement("span");
  top.className = "milestone-top";
  top.append(name, price);
  const card = document.createElement("button");
  card.type = "button";
  card.className = "milestone";
  card.append(top);
  if (!isPurchased && !isAffordable) {
    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.width = `${(stats.balance / wish.price) * 100}%`;
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.append(fill);
    card.append(bar);
  }
  const sub = document.createElement("span");
  sub.className = "record-sub";
  let status = `あと${yen(wish.price - stats.balance)}`;
  if (isPurchased) {
    status = `${formatDate(wish.purchasedAt).split(" ")[0]} に購入`;
  } else if (isAffordable) {
    status = "買えるよ!押して「買った」を記録できます";
  }
  sub.textContent = [status, wish.memo].filter(Boolean).join(" ・ ");
  card.append(sub);
  card.addEventListener("click", () => openWishForm(wish));
  const item = document.createElement("li");
  item.append(card);
  return item;
}

function renderWishes() {
  document.getElementById("wish-balance").textContent = stats.balance.toLocaleString("ja-JP");
  const pending = latestWishes.filter((wish) => !wish.purchasedAt).sort((a, b) => a.price - b.price);
  const purchased = latestWishes
    .filter((wish) => wish.purchasedAt)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  document.getElementById("wishes").replaceChildren(...pending.map(wishCard));
  document.getElementById("wishes-empty").hidden = pending.length > 0;
  document.getElementById("purchased").replaceChildren(...purchased.map(wishCard));
  document.getElementById("purchased-section").hidden = purchased.length === 0;
}

function resetWishButtons() {
  buyWishButton.textContent = editingWish ? `買った(貯金額から${yen(editingWish.price)}引く)` : "買った";
  delete buyWishButton.dataset.armed;
  deleteWishButton.textContent = "リストから削除";
  delete deleteWishButton.dataset.armed;
}

function openWishForm(wish = null) {
  editingWish = wish;
  document.getElementById("wish-title").textContent = wish ? "ほしいものを修正" : "ほしいものを追加";
  wishNameField.value = wish ? wish.name : "";
  wishPriceField.value = wish ? wish.price : "";
  wishMemoField.value = wish?.memo ?? "";
  buyWishButton.hidden = !wish || Boolean(wish.purchasedAt) || stats.balance < wish.price;
  deleteWishButton.hidden = !wish;
  resetWishButtons();
  wishSheet.showModal();
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
      wishes: latestWishes,
      discovered: [...loadDiscovered()],
      eggStarts: loadEggStarts(),
      raised: loadRaised(),
      avoidType: loadAvoidType(),
      background: loadBackground(),
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
  setBackupStatus(
    `記録${latestRecords.length}件、目標${latestGoals.length}件、ほしいもの${latestWishes.length}件を書き出しました。`,
  );
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
      (record?.type === "gaman" || record?.type === "spent" || record?.type === "purchase") &&
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
  // 版1のバックアップには wishes がない
  if (data.wishes !== undefined && !Array.isArray(data.wishes)) {
    throw new Error("invalid wishes");
  }
  const wishes = (data.wishes ?? []).map((wish) => {
    const isValid =
      typeof wish?.name === "string" &&
      wish.name.trim() !== "" &&
      isValidAmount(wish.price) &&
      isValidDate(wish.createdAt) &&
      (wish.purchasedAt === undefined || isValidDate(wish.purchasedAt));
    if (!isValid) throw new Error("invalid wish");
    return {
      name: wish.name,
      price: wish.price,
      createdAt: wish.createdAt,
      ...(typeof wish.memo === "string" && { memo: wish.memo }),
      ...(wish.purchasedAt && { purchasedAt: wish.purchasedAt }),
    };
  });
  // 図鑑は読めなくても記録の復元は止めない
  const discovered = Array.isArray(data.discovered) ? data.discovered.filter((id) => CHARACTER_IDS.includes(id)) : [];
  const eggStarts = Array.isArray(data.eggStarts) ? data.eggStarts.filter(isValidDate).sort() : [];
  const raised = {};
  for (const id of CHARACTER_IDS) {
    const count = data.raised?.[id];
    if (Number.isSafeInteger(count) && count > 0) raised[id] = count;
  }
  return {
    records,
    goals,
    wishes,
    discovered,
    eggStarts,
    raised,
    avoidType: TYPES.some((type) => type.id === data.avoidType) ? data.avoidType : null,
    background: BACKGROUNDS.some((background) => background.id === data.background) ? data.background : null,
    exportedAt: isValidDate(data.exportedAt) ? data.exportedAt : null,
  };
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
    `書き出し日:${date}、記録${pendingImport.records.length}件、目標${pendingImport.goals.length}件、` +
    `ほしいもの${pendingImport.wishes.length}件。` +
    `今の記録${latestRecords.length}件、目標${latestGoals.length}件、ほしいもの${latestWishes.length}件は、この内容に置き換わります。`;
  document.getElementById("import-confirm").hidden = false;
  setBackupStatus("");
}

function zukanEntry(id, label, character, discovered) {
  const isFound = discovered.has(id);
  const image = document.createElement("img");
  image.className = "zukan-image";
  image.src = `chara/${id}.png`;
  image.alt = "";
  image.width = 72;
  image.height = 72;
  image.loading = "lazy";
  const labelEl = document.createElement("span");
  labelEl.className = "zukan-label";
  labelEl.textContent = label;
  const name = document.createElement("strong");
  name.className = "zukan-name";
  name.textContent = isFound ? character.name : "???";
  const text = document.createElement("p");
  text.className = "zukan-text";
  text.textContent = isFound ? character.text : "まだ出会っていません";
  const body = document.createElement("div");
  body.append(labelEl, name, text);
  if (id === reachedCharacterIds(stats).at(-1)) {
    const badge = document.createElement("span");
    badge.className = "zukan-badge";
    badge.textContent = "いまの相棒";
    labelEl.after(badge);
  }
  const raisedCount = loadRaised()[id];
  if (raisedCount) {
    const raised = document.createElement("span");
    raised.className = "zukan-raised";
    raised.textContent = raisedCount > 1 ? `育てきった ×${raisedCount}` : "育てきった";
    name.after(raised);
  }
  const item = document.createElement("li");
  item.className = "zukan-entry";
  item.dataset.found = isFound;
  item.append(image, body);
  return item;
}

function renderZukan(discovered) {
  document.getElementById("zukan-count").textContent = `${discovered.size}/${CHARACTER_IDS.length}`;
  const eggList = document.createElement("ul");
  eggList.className = "zukan-list";
  eggList.append(zukanEntry("egg", "はじまりの卵", EGG, discovered));
  const groups = ZUKAN_ORDER.map((typeId) => {
    const type = TYPES.find((candidate) => candidate.id === typeId);
    const title = document.createElement("h3");
    title.className = "zukan-type";
    title.textContent = type.name;
    const theme = document.createElement("p");
    theme.className = "zukan-theme";
    theme.textContent = type.theme;
    const list = document.createElement("ul");
    list.className = "zukan-list";
    list.append(
      ...type.characters.map((character, index) =>
        zukanEntry(`${type.id}-${index + 1}`, STAGES[index + 1].name, character, discovered),
      ),
    );
    const section = document.createElement("section");
    section.append(title, theme, list);
    return section;
  });
  document.getElementById("zukan").replaceChildren(eggList, ...groups);
}

async function render(db) {
  const [records, goals, wishes] = await Promise.all([
    getAll(db, STORE),
    getAll(db, GOAL_STORE),
    getAll(db, WISH_STORE),
  ]);
  latestRecords = records;
  latestGoals = goals;
  latestWishes = wishes;
  stats = getStats(records, goals);
  renderBackupStatus();
  totalEl.textContent = stats.balance.toLocaleString("ja-JP");
  countEl.textContent = stats.gamanCount.toLocaleString("ja-JP");
  document.getElementById("cumulative").textContent = stats.exp.toLocaleString("ja-JP");
  document.getElementById("stage").textContent = characterName(stats);
  document.getElementById("level").textContent = stats.level;
  const start = levelStartExp(stats.level);
  const next = levelStartExp(stats.level + 1);
  document.getElementById("level-bar").style.width = `${((stats.characterExp - start) / (next - start)) * 100}%`;
  document.getElementById("next-level").textContent = (next - stats.characterExp).toLocaleString("ja-JP");
  document.getElementById("next-egg").hidden = stats.stage.id !== "adult";
  resetNextEggButton();
  characterEl.src = characterImage(stats);
  renderZukan(addDiscovered(reachedCharacterIds(stats)));
  clearTimeout(moodTimer);
  characterEl.dataset.mood = stats.isLonely ? "sad" : "normal";
  renderHistory(records);
  renderMilestones();
  renderChart();
  renderWishes();
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
  // 進化はめったに起きないので、目標の達成より先に知らせる
  if (stats.stage.id !== before.stage.id) {
    message =
      before.stage.id === "egg"
        ? `たまごが割れて、${characterName(stats)}が生まれたよ!`
        : `+${yen(amount)}! ${characterName(stats)}に進化したよ!`;
  } else if (newlyAchieved.length > 0) {
    message = `+${yen(amount)}! 「${newlyAchieved[0].name}」を達成!`;
  } else if (stats.level > before.level) {
    message = `+${yen(amount)}! Lv.${stats.level}にレベルアップ!`;
  }
  messageEl.textContent = message;
  characterEl.dataset.mood = "happy";
  moodTimer = setTimeout(() => {
    characterEl.dataset.mood = "normal";
  }, 1500);
}

function resetNextEggButton() {
  const button = document.getElementById("next-egg");
  button.textContent = "次のたまごを迎える";
  delete button.dataset.armed;
}

// 記録は残したまま、今から我慢した分で新しいたまごを育てる
async function startNextEgg(db) {
  const finished = characterName(stats);
  const finishedId = reachedCharacterIds(stats).at(-1);
  const raised = loadRaised();
  raised[finishedId] = (raised[finishedId] ?? 0) + 1;
  writeStorage(RAISED_KEY, raised);
  rememberCurrentType();
  writeStorage(EGG_STARTS_KEY, [...loadEggStarts(), new Date().toISOString()]);
  await render(db);
  messageEl.textContent = `${finished}は図鑑で見守っているよ。新しいたまごが届いた!`;
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
  for (const view of ["home", "history", "milestones", "wishes", "settings"]) {
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
  renderBackgroundOptions();
  const zukanSheet = document.getElementById("zukan-sheet");
  document.getElementById("open-zukan").addEventListener("click", () => zukanSheet.showModal());
  characterEl.addEventListener("click", () => zukanSheet.showModal());
  document.getElementById("close-zukan").addEventListener("click", () => zukanSheet.close());
  // 押し間違えで相棒と別れないよう、2回押して確定する
  document.getElementById("next-egg").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!button.dataset.armed) {
      button.dataset.armed = "true";
      button.textContent = `${characterName(stats)}を図鑑に送り、たまごを迎える(もう一度押す)`;
      return;
    }
    await startNextEgg(db);
  });
  document.getElementById("tab-home").addEventListener("click", () => showView("home"));
  document.getElementById("tab-history").addEventListener("click", () => showView("history"));
  document.getElementById("tab-milestones").addEventListener("click", () => showView("milestones"));
  document.getElementById("tab-settings").addEventListener("click", () => showView("settings"));
  document.getElementById("tab-wishes").addEventListener("click", () => showView("wishes"));

  for (const button of document.querySelectorAll(".range-option")) {
    button.addEventListener("click", () => {
      chartRangeDays = Number(button.dataset.days);
      for (const other of document.querySelectorAll(".range-option")) {
        other.setAttribute("aria-pressed", String(other === button));
      }
      renderChart();
    });
  }
  chartEl.addEventListener("pointerdown", handleChartPointer);
  chartEl.addEventListener("pointermove", handleChartPointer);
  chartEl.addEventListener("pointerleave", (event) => {
    // スマホは指を離した後も値を読めるよう、マウスのときだけ消す
    if (event.pointerType === "mouse") hideChartCursor();
  });

  const wishStatus = document.getElementById("wish-status");
  document.getElementById("open-wish").addEventListener("click", () => openWishForm());
  document.getElementById("close-wish").addEventListener("click", () => wishSheet.close());
  document.getElementById("wish-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = wishNameField.value.trim();
    if (!name) {
      wishNameField.value = "";
      wishNameField.reportValidity();
      return;
    }
    const price = Number(wishPriceField.value);
    const memo = wishMemoField.value.trim();
    await writeStore(
      db,
      (store) => {
        if (editingWish) {
          store.put({ ...editingWish, name, price, memo });
        } else {
          store.add({ name, price, memo, createdAt: new Date().toISOString() });
        }
      },
      WISH_STORE,
    );
    wishStatus.textContent = "";
    wishSheet.close();
    await render(db);
  });
  // どちらも誤操作を防ぐため、2回押すと実行する
  buyWishButton.addEventListener("click", async () => {
    if (!buyWishButton.dataset.armed) {
      buyWishButton.dataset.armed = "true";
      buyWishButton.textContent = "もう一度押すと記録します";
      return;
    }
    await purchaseWish(db, editingWish);
    wishStatus.textContent = `「${editingWish.name}」を買ったよ!がんばったね!`;
    messageEl.textContent = `「${editingWish.name}」おめでとう!`;
    wishSheet.close();
    await render(db);
  });
  deleteWishButton.addEventListener("click", async () => {
    if (!deleteWishButton.dataset.armed) {
      deleteWishButton.dataset.armed = "true";
      deleteWishButton.textContent = "もう一度押すと削除します";
      return;
    }
    await writeStore(db, (store) => store.delete(editingWish.id), WISH_STORE);
    wishStatus.textContent = "";
    wishSheet.close();
    await render(db);
  });
  document.getElementById("backup-hint").addEventListener("click", () => showView("settings"));
  document.getElementById("export-data").addEventListener("click", exportBackup);
  document.getElementById("import-file").addEventListener("change", (event) => chooseImportFile(event.target));
  document.getElementById("import-cancel").addEventListener("click", clearPendingImport);
  document.getElementById("import-apply").addEventListener("click", async () => {
    try {
      await replaceAllData(db, pendingImport.records, pendingImport.goals, pendingImport.wishes);
    } catch {
      setBackupStatus("読み込めませんでした。今のデータは変更していません。");
      return;
    }
    // 図鑑は置き換えず、今まで出会ったキャラに足す
    addDiscovered(pendingImport.discovered);
    mergeRaised(pendingImport.raised);
    // 今のキャラがどこから育っているかは記録と対になるので、記録と一緒に置き換える
    writeStorage(EGG_STARTS_KEY, pendingImport.eggStarts);
    writeStorage(AVOID_TYPE_KEY, pendingImport.avoidType);
    if (pendingImport.background) applyBackground(pendingImport.background);
    clearPendingImport();
    await render(db);
    setBackupStatus(
      `記録${latestRecords.length}件、目標${latestGoals.length}件、ほしいもの${latestWishes.length}件を復元しました。`,
    );
  });
  const resetConfirm = document.getElementById("reset-confirm");
  const resetStatus = document.getElementById("reset-status");
  document.getElementById("reset-open").addEventListener("click", () => {
    if (latestRecords.length === 0) {
      resetStatus.textContent = "リセットする記録はありません。";
      return;
    }
    document.getElementById("reset-summary").textContent =
      `${latestRecords.length}件の記録をすべて削除します。元に戻すには、書き出したファイルが必要です。`;
    resetStatus.textContent = "";
    resetConfirm.hidden = false;
  });
  document.getElementById("reset-cancel").addEventListener("click", () => {
    resetConfirm.hidden = true;
  });
  document.getElementById("reset-apply").addEventListener("click", async () => {
    await writeStore(db, (store) => store.clear());
    rememberCurrentType();
    writeStorage(EGG_STARTS_KEY, []);
    resetConfirm.hidden = true;
    await render(db);
    messageEl.textContent = "また一緒にがんばろう!";
    resetStatus.textContent = "記録をリセットしました。";
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

function registerServiceWorker() {
  // localhost は開発中の変更をすぐ確認できるよう対象外にする
  if (!("serviceWorker" in navigator) || location.hostname === "localhost") return;
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // 入力中は画面を読み込み直さず、次に開いたときに新しい版にする
    if (wasControlled && !document.querySelector("dialog[open]")) {
      location.reload();
    }
  });
  navigator.serviceWorker.register("sw.js").then((registration) => {
    // ホーム画面のアプリは開き直さず復帰することがあるので、復帰時にも更新を確認する
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update().catch(() => {});
      }
    });
  }).catch(console.error);
}

registerServiceWorker();

start().catch((error) => {
  console.error(error);
  messageEl.textContent = "データを読み込めませんでした。ページを開き直してください。";
});
