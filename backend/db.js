const { MongoClient } = require("mongodb");

// 資料路由（casesFixed.js / statsFixed.js）共用的單一 MongoClient。
//
// 注意：server.js 另有一條獨立的 mongoose 連線，負責連線 lifecycle/自動重連，
// 並註冊 backend/models/Case.js 以建立索引 —— 那條 mongoose 連線刻意保留，勿移除。
// 本模組只負責「資料查詢用」的原生 driver 連線，兩者互不干擾。
const DB_NAME = process.env.MONGODB_DB_NAME || "sports-doping-db";

let client = null;
let db = null;
let connecting = null;

// 啟動（或重用）共用連線。可安全重複呼叫：已連線時直接回傳，
// 連線中時回傳同一個 in-flight promise，避免重複開 pool。
function connect() {
  if (db) return Promise.resolve(db);
  if (connecting) return connecting;

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  connecting = MongoClient.connect(uri)
    .then((connectedClient) => {
      client = connectedClient;
      db = connectedClient.db(DB_NAME);
      return db;
    })
    .catch((err) => {
      // 連線失敗時清除 in-flight 狀態，讓後續呼叫可重試
      connecting = null;
      throw err;
    });

  return connecting;
}

// 取得已連線的 db 實例；尚未連上時回傳 null（handler 以 if(!db) return 500 擋）。
function getDb() {
  return db;
}

// 關閉連線並重置狀態（主要供測試 teardown 使用）。
async function close() {
  if (client) await client.close();
  client = null;
  db = null;
  connecting = null;
}

module.exports = { connect, getDb, close, DB_NAME };
