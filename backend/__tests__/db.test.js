import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

// 驗證 P2-6 統一連線：backend/db.js 的 connect/getDb/close 與 singleton 行為。
let mongod;
let db; // db.js 模組的匯出

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  const mod = await import("../db.js");
  db = mod.default || mod;
});

afterAll(async () => {
  if (db) await db.close();
  if (mongod) await mongod.stop();
});

describe("backend/db.js 共用連線", () => {
  it("connect() 回傳可用的 db 實例", async () => {
    const instance = await db.connect();
    expect(instance).toBeTruthy();
    expect(typeof instance.collection).toBe("function");
  });

  it("getDb() 在連線後回傳與 connect() 相同的 db 實例（singleton）", async () => {
    const a = await db.connect();
    const b = db.getDb();
    expect(b).toBe(a);
  });

  it("重複 connect() 重用同一連線，不重開新 pool", async () => {
    const a = await db.connect();
    const b = await db.connect();
    expect(b).toBe(a);
  });

  it("DB_NAME 預設為 sports-doping-db", () => {
    expect(db.DB_NAME).toBe("sports-doping-db");
  });

  it("close() 後 getDb() 回傳 null（連線狀態被重置）", async () => {
    await db.connect();
    await db.close();
    expect(db.getDb()).toBeNull();
  });
});
