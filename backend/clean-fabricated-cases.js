#!/usr/bin/env node
/**
 * clean-fabricated-cases.js — 安全清除「亂數生成的虛構案例」
 *
 * 背景：backend/loadCompleteDatabase.js 曾用 Math.random() 從姓名/國家/物質池
 * 拼出約 163 筆假案例，其 eventBackground 一律是模板：
 *   `${年}年${賽事}期間藥檢呈陽性反應，違反了反禁藥規則。`
 * 真實案例（含 add_verified_*.js、add_famous_athletes.js 等）都有具體敘述，不符此模板。
 * 本腳本以此高精度「指紋」辨識並安全移除，不使用會誤傷真實常見英文名的假名 regex。
 *
 * 用法（一律先 dry-run，確認備份無誤再 --confirm）：
 *   export MONGODB_URI='mongodb+srv://...'          # 絕不硬編憑證，用環境變數
 *   node backend/clean-fabricated-cases.js           # 1) DRY-RUN：只報告 + 匯出備份，不刪
 *   node backend/clean-fabricated-cases.js --confirm # 2) 實際刪除（刪前必先寫備份）
 *   node backend/clean-fabricated-cases.js --restore backend/backups/fabricated-XXX.json  # 3) 回滾
 *   node backend/clean-fabricated-cases.js --selftest # 不連 DB，驗證指紋分類正確性
 *
 * 安全設計：dry-run 預設、刪除前一律匯出可還原備份、以 _id 精準刪、支援 --restore 回滾、
 *          必須用 MONGODB_URI（拒絕硬編）、冪等（再跑一次應為 0 筆）。
 */
'use strict';
const fs = require('fs');
const path = require('path');

// —— 虛構案例指紋（生成器 loadCompleteDatabase.js 的模板輸出）——
const FABRICATED_EVENT = /^\d{4}年.+期間藥檢呈陽性反應，違反了反禁藥規則。$/;
const FABRICATED_SUMMARY = /運動員因使用.+被禁賽的案例。$/;

/** 主指紋：eventBackground 完全符合生成模板即判定為虛構（真人不會寫這句通用模板）。 */
function isFabricated(c) {
  const ev = typeof c.eventBackground === 'string' ? c.eventBackground.trim() : '';
  return FABRICATED_EVENT.test(ev);
}
/** 輔助訊號：summary 也是模板 + 無來源，供交叉核對信心。 */
function fabricationSignals(c) {
  const ev = typeof c.eventBackground === 'string' ? c.eventBackground.trim() : '';
  const sm = typeof c.summary === 'string' ? c.summary.trim() : '';
  return {
    eventTemplate: FABRICATED_EVENT.test(ev),
    summaryTemplate: FABRICATED_SUMMARY.test(sm),
    noSources: !(Array.isArray(c.sourceLinks) && c.sourceLinks.length > 0),
  };
}
function hasSources(c) {
  return Array.isArray(c.sourceLinks) && c.sourceLinks.length > 0;
}

// ———————————————— self-test（不需 DB）————————————————
function selftest() {
  const real = [
    { athleteName: 'Ben Johnson', eventBackground: '1988年漢城奧運會100公尺決賽，以9.79秒打破世界紀錄奪金，但賽後藥檢呈陽性反應。' },
    { athleteName: 'Tom Simpson', eventBackground: '英國自行車手Tom Simpson在1967年環法賽途中因使用興奮劑導致死亡，成為現代反禁藥制度建立的重要轉折點。' },
    { athleteName: 'Rick DeMont', eventBackground: '美國游泳選手Rick DeMont因服用氣喘藥物中的麻黃鹼，在1972年慕尼黑奧運400公尺自由式金牌被取消。' },
    { athleteName: 'Maria Sharapova', eventBackground: '2016年澳網期間藥檢呈陽性，聲稱不知道Meldonium已被列入禁藥清單。' }, // 含"期間...藥檢陽性"但非完整模板
  ];
  const fake = [
    { athleteName: 'Karen Perez', eventBackground: '2024年歐洲錦標賽期間藥檢呈陽性反應，違反了反禁藥規則。' },
    { athleteName: 'Andrew Moore', eventBackground: '1994年國際邀請賽期間藥檢呈陽性反應，違反了反禁藥規則。' },
    { athleteName: 'Mary Garcia', eventBackground: '1993年世界錦標賽期間藥檢呈陽性反應，違反了反禁藥規則。' },
  ];
  let ok = true;
  for (const c of real) if (isFabricated(c)) { ok = false; console.error('✗ 誤判真實為虛構:', c.athleteName); }
  for (const c of fake) if (!isFabricated(c)) { ok = false; console.error('✗ 漏判虛構:', c.athleteName); }
  console.log(ok
    ? `✅ self-test 通過：${real.length} 真實全保留、${fake.length} 虛構全命中（含邊界：Sharapova 有「期間藥檢陽性」字樣仍正確保留）`
    : '❌ self-test 失敗（見上）');
  process.exit(ok ? 0 : 1);
}

// ———————————————— main ————————————————
async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) return selftest();

  const URI = process.env.MONGODB_URI;
  if (!URI) {
    console.error('✗ 必須設定 MONGODB_URI 環境變數（本腳本拒絕硬編憑證）。');
    console.error('  例：export MONGODB_URI="mongodb+srv://user:pass@host/db" 再執行。');
    process.exit(1);
  }
  const { MongoClient, ObjectId } = require('mongodb');
  const DB_NAME = process.env.MONGO_DB || 'sports-doping-db';
  const CONFIRM = argv.includes('--confirm');
  const ri = argv.indexOf('--restore');
  const RESTORE_FILE = ri >= 0 ? argv[ri + 1] : null;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');

  const client = await MongoClient.connect(URI);
  try {
    const col = client.db(DB_NAME).collection('cases');

    // —— 回滾模式 ——
    if (RESTORE_FILE) {
      const docs = JSON.parse(fs.readFileSync(RESTORE_FILE, 'utf8'));
      const restored = docs.map((d) => (d._id ? { ...d, _id: new ObjectId(d._id) } : d));
      const r = await col.insertMany(restored, { ordered: false });
      console.log(`↩︎ 已從 ${RESTORE_FILE} 還原 ${r.insertedCount} 筆案例`);
      return;
    }

    const all = await col.find({}).toArray();
    const fabricated = all.filter(isFabricated);
    const needsReview = all.filter((c) => !isFabricated(c) && !hasSources(c));
    const keptCount = all.length - fabricated.length;

    console.log(`\n📊 資料庫共 ${all.length} 筆案例（db: ${DB_NAME}）`);
    console.log(`❌ 模板虛構（將移除）: ${fabricated.length}`);
    console.log(`⚠️  無來源、待人工核實（保留、不刪）: ${needsReview.length}`);
    console.log(`✅ 移除後保留: ${keptCount}`);

    // 分佈與抽樣，供人工判斷
    if (fabricated.length) {
      const bySport = {};
      fabricated.forEach((c) => { bySport[c.sport] = (bySport[c.sport] || 0) + 1; });
      console.log('\n  虛構案例運動別分佈:', JSON.stringify(bySport));
      console.log('  抽樣 5 筆:');
      fabricated.slice(0, 5).forEach((c) =>
        console.log(`    - ${c.athleteName} (${c.nationality}, ${c.year}) ${c.sport} / ${c.substance}`));
    }

    // 一律先寫備份（dry-run 也寫，供人工檢視）
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `fabricated-${stamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(fabricated, null, 2));
    console.log(`\n💾 待刪案例完整備份已匯出: ${backupFile}`);
    const reviewFile = path.join(backupDir, `needs-review-${stamp}.json`);
    fs.writeFileSync(reviewFile, JSON.stringify(
      needsReview.map((c) => ({ _id: String(c._id), athleteName: c.athleteName, sport: c.sport, year: c.year, substance: c.substance })), null, 2));
    console.log(`📝 待人工核實清單（保留）: ${reviewFile}`);

    if (!CONFIRM) {
      console.log('\n🔎 DRY-RUN：未刪除任何資料。請開上面備份檔核對無誤後，加 --confirm 執行刪除。');
      return;
    }
    if (!fabricated.length) { console.log('\n✅ 無符合虛構指紋的案例，無需刪除（冪等）。'); return; }

    const ids = fabricated.map((c) => c._id);
    const res = await col.deleteMany({ _id: { $in: ids } });
    const finalCount = await col.countDocuments();
    console.log(`\n🗑️  已刪除 ${res.deletedCount} 筆虛構案例。案例總數 ${all.length} → ${finalCount}。`);
    console.log(`↩︎ 如需回滾：node backend/clean-fabricated-cases.js --restore ${backupFile}`);
  } finally {
    await client.close();
  }
}

main().catch((e) => { console.error('清洗過程發生錯誤：', e); process.exit(1); });
