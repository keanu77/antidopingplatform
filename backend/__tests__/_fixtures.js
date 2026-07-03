import request from "supertest";

// 等待路由自身的資料庫連線就緒。
// vitest 下，測試用 ESM import 與 route 檔的 CJS require 可能各自持有一份 db.js 實例；
// route 自身的連線於 import 時才非同步建立，因此在跑斷言前先輪詢到非 500 為止（只讀、不污染資料）。
export async function waitForRoute(app, path, tries = 100, delayMs = 30) {
  for (let i = 0; i < tries; i++) {
    const res = await request(app).get(path);
    if (res.status !== 500) return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`route ${path} 在 ${tries} 次嘗試後仍未就緒`);
}

// 供 cases / stats 整合測試共用的案例種子資料。
// 欄位對齊 casesFixed.js / statsFixed.js 查詢與聚合所使用的欄位。
export const SEED_CASES = [
  {
    athleteName: "Alpha Runner",
    sport: "田徑",
    nationality: "美國",
    year: 2016,
    substance: "Meldonium",
    substanceCategory: "S4.4: 激素及代謝調節劑",
    summary: "測試案例 A",
    punishment: {
      banDuration: "2年",
      medalStripped: true,
      resultsCancelled: true,
    },
  },
  {
    athleteName: "Beta Cyclist",
    sport: "自行車",
    nationality: "西班牙",
    year: 2010,
    substance: "EPO",
    substanceCategory: "S2.1: 紅血球生成刺激劑",
    summary: "測試案例 B",
    punishment: {
      banDuration: "終身禁賽",
      medalStripped: false,
      resultsCancelled: true,
    },
  },
  {
    athleteName: "Gamma Lifter",
    sport: "舉重",
    nationality: "美國",
    year: 2016,
    substance: "Testosterone",
    substanceCategory: "S1.1: 外源性同化雄性類固醇",
    summary: "測試案例 C",
    punishment: {
      banDuration: "4年",
      medalStripped: false,
      resultsCancelled: false,
    },
  },
  {
    athleteName: "Delta Swimmer",
    sport: "游泳",
    nationality: "澳洲",
    year: 2000,
    substance: "Salbutamol",
    substanceCategory: "S3: Beta-2激動劑",
    summary: "測試案例 D",
    punishment: {
      banDuration: "無禁賽（TUE證明）",
      medalStripped: false,
      resultsCancelled: false,
    },
  },
];
