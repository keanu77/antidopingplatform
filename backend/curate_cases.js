/**
 * 案例資料勘誤 curation（Codex Pass1 + Claude Pass2 對抗驗證後）。
 *
 * 三段操作（皆 dry-run 預設，--apply 才寫入）：
 *   1) FIXES   — 11 筆非破壞性 $set（分類更正 + 公認裁決結果更新），依 _id 精準比對
 *   2) DELETES — 6 筆明確重複/錯置條目刪除（保留最正確那筆，_id 標於 keep）
 *   3) INSERTS — 3 筆近年重要新案例（Valieva / Halep / Ryan Garcia），依 athleteName+year 去重
 *
 * 用法：
 *   node backend/curate_cases.js            # DRY-RUN：只印計畫，不寫入
 *   node backend/curate_cases.js --apply    # 實際寫入（需 MONGODB_URI）
 *
 * 冪等：FIXES 為固定目標值；DELETES 找不到即略過；INSERTS 存在即略過。重跑安全。
 */
const { MongoClient, ObjectId } = require("mongodb");

const DB_NAME = process.env.MONGODB_DB_NAME || "sports-doping-db";
const APPLY = process.argv.includes("--apply");

// ── 1) 非破壞性欄位更正（欄位名對齊 cases collection）──
const FIXES = [
  {
    id: "69b65f2636bcbfd28155b3a8",
    who: "Alberto Contador",
    set: { substanceCategory: "S1.2: 合成代謝劑（其他合成代謝劑）" },
    why: "Clenbuterol 屬 S1.2（substances.json 確認），非 S6",
  },
  {
    id: "69b66048d75c98caff10d2a1",
    who: "Canelo Álvarez",
    set: { substanceCategory: "S1.2: 合成代謝劑（其他合成代謝劑）" },
    why: "Clenbuterol 屬 S1.2；原標的 S4 為誤",
  },
  {
    id: "69b65f2636bcbfd28155b3a4",
    who: "Sun Yang（2014 TMZ 案）",
    set: { substanceCategory: "S4.4: 代謝調節劑" },
    why: "Trimetazidine 屬 S4.4，非 S6",
  },
  {
    id: "69b65f89dc4756c7094de63a",
    who: "Brock Lesnar",
    set: { substanceCategory: "S4.2: 抗雌激素物質" },
    why: "Clomiphene 為抗雌激素 SERM 屬 S4.2，非 S4.4",
  },
  {
    id: "69b65f6a0ccdbbc8ed69151c",
    who: "Simone Biles",
    set: { substance: "Methylphenidate (派醋甲酯／利他能)" },
    why: "原中文『甲基苯丙胺』為 methamphetamine 之誤；S6 分類正確",
  },
  {
    id: "69b6604f169286dabd5ccb9d",
    who: "Jannik Sinner",
    set: { "punishment.banDuration": "3個月（2025 WADA 案件和解）" },
    why: "2025-02 WADA 和解處 3 個月禁賽；原『無禁賽』已過時",
  },
  {
    id: "69b6604554cdf78b1ff518c7",
    who: "Paul Pogba",
    set: { "punishment.banDuration": "18個月（CAS 2024 減刑，原判 4 年）" },
    why: "CAS 2024-10 減為 18 個月；原『調查中』已過時",
  },
  {
    id: "69b65f89dc4756c7094de630",
    who: "Asafa Powell",
    set: { "punishment.banDuration": "6個月（CAS 減刑，原判 18 個月）" },
    why: "CAS 將 oxilofrine 案由 18 個月減為 6 個月",
  },
  {
    id: "69b6604af91309d25495c28e",
    who: "Ryan Lochte",
    set: {
      substance: "靜脈輸注（禁用方法，非利尿劑）",
      substanceCategory: "M2: 化學和物理操作",
    },
    why: "2018 違規為禁止的靜脈輸注（>100mL），非 furosemide/S5",
  },
  {
    id: "69b65f690ccdbbc8ed6914f7",
    who: "Chris Froome",
    set: {
      "punishment.banDuration": "無處罰（2018 UCI/WADA 結案，認定非 AAF；非 TUE）",
    },
    why: "沙丁胺醇案經證據審查結案，非以 TUE 證明清白",
  },
  {
    id: "69b6604554cdf78b1ff518c6",
    who: "Andre Agassi",
    set: { "punishment.banDuration": "無正式禁賽（ATP 接受誤服說法；非 TUE）" },
    why: "1997 甲基安非他命案 ATP 接受其說法未處分，非 TUE",
  },
];

// ── 2) 明確重複/錯置條目刪除（keep = 保留的那筆）──
const DELETES = [
  {
    id: "69b6604405824339e4a3e679",
    who: 'Saúl "Canelo" Álvarez',
    keep: "69b66048d75c98caff10d2a1（Canelo Álvarez）",
    why: "與 Canelo Álvarez 為同一 2018 clenbuterol 案，重複",
  },
  {
    id: "69b6604405824339e4a3e677",
    who: "Joakim Noah（Ostarine/2016）",
    keep: "69b65f8b442de49e2af10dc4（Ligandrol/2017）",
    why: "Noah 實際案為 2017 LGD-4033；此筆物質與年份皆誤，重複",
  },
  {
    id: "69b65f8b442de49e2af10dbf",
    who: "OJ Mayo（未公開/永久禁賽）",
    keep: "69b6604554cdf78b1ff518c5（O.J. Mayo/DHEA/2年）",
    why: "同一 2016 NBA 案；『永久禁賽』有誤（實為 2 年後可申請復權）",
  },
  {
    id: "69b65f8b442de49e2af10da6",
    who: "Alex Rodriguez (A-Rod)（211場/2014）",
    keep: "69b6604e4e8dc5d56e42f3ea（162場/2014）",
    why: "A-Rod 最終裁罰為 162 場；211 場為仲裁前原判，重複",
  },
  {
    id: "69b6604554cdf78b1ff518c4",
    who: "Alex Rodriguez（211場/2013）",
    keep: "69b6604e4e8dc5d56e42f3ea（162場/2014）",
    why: "同上，重複條目",
  },
  {
    id: "69b65f89dc4756c7094de62e",
    who: "Tyson Gay（Oxilofrine）",
    keep: "69b65f2636bcbfd28155b3a6（合成代謝類固醇）",
    why: "Gay 2013 案為合成代謝類固醇；oxilofrine 實為 Powell/Simpson 案，錯置重複",
  },
];

// ── 3) 近年重要新案例（依 athleteName+year 去重）──
const INSERTS = [
  {
    athleteName: "Kamila Valieva (卡米拉·瓦利耶娃)",
    nationality: "俄羅斯",
    sport: "花式滑冰",
    substance: "Trimetazidine",
    substanceCategory: "S4.4: 代謝調節劑",
    year: 2022,
    eventBackground:
      "俄羅斯花式滑冰選手瓦利耶娃於 2021 年 12 月的樣本檢出心臟藥物 trimetazidine（TMZ），在 2022 年北京冬奧期間曝光。國際體育仲裁法庭（CAS）於 2024 年 1 月裁定 4 年禁賽，追溯自 2021 年 12 月 25 日，並取消其自該日起的所有成績。",
    punishment: {
      banDuration: "4年（CAS 2024 判決，追溯自 2021 年 12 月）",
      resultsCancelled: true,
      medalStripped: true,
      otherPenalties:
        "俄羅斯奧會（ROC）2022 北京冬奧團體賽金牌遭取消，美國遞補金牌、日本銀牌",
    },
    sourceLinks: [
      { title: "CAS Media Release – Valieva", url: "https://www.tas-cas.org/", type: "CAS官方" },
      { title: "WADA Statement", url: "https://www.wada-ama.org/", type: "WADA" },
      { title: "ISU Decision", url: "https://www.isu.org/", type: "ISU" },
    ],
    summary:
      "2022 北京冬奧最受矚目的禁藥案，凸顯未成年『受保護人員』的用藥責任與團隊監督問題。",
    educationalNotes:
      "Trimetazidine 屬 S4.4 代謝調節劑，全時段禁用。本案涉及未成年受保護人員的責任認定，以及成績追溯取消對團體獎牌的連帶影響。",
    additionalInfo: {
      legalProcess: "RUSADA 初判 → WADA/ISU 上訴至 CAS，2024 年 1 月裁定 4 年禁賽",
      ageContext: "採樣時 15 歲，屬 WADA Code 定義之『受保護人員』",
      teamImpact: "ROC 團體金牌遭剝奪，獎牌重新分配",
    },
    createdAt: new Date(),
  },
  {
    athleteName: "Simona Halep (西蒙娜·哈勒普)",
    nationality: "羅馬尼亞",
    sport: "網球",
    substance: "Roxadustat（併生物護照異常）",
    substanceCategory: "S2: 肽類激素、生長因子及相關物質（HIF 活化劑）",
    year: 2022,
    eventBackground:
      "前世界第一哈勒普於 2022 年美國網球公開賽期間檢出低劑量 roxadustat（缺氧誘導因子 HIF 活化劑），另有生物護照（ABP）異常。ITIA 於 2023 年判處 4 年禁賽；CAS 於 2024 年 3 月大幅減為 9 個月（認定與受污染補充劑有關），哈勒普已服滿並復出。",
    punishment: {
      banDuration: "9個月（CAS 2024 由 4 年減刑）",
      resultsCancelled: false,
      medalStripped: false,
      otherPenalties: "禁賽期間排名積分歸零",
    },
    sourceLinks: [
      { title: "CAS Decision – Halep", url: "https://www.tas-cas.org/", type: "CAS官方" },
      { title: "ITIA Statement", url: "https://www.itia.tennis/", type: "ITIA" },
    ],
    summary:
      "由 4 年大幅減為 9 個月的知名減刑案，凸顯補充劑污染舉證與生物護照證據的爭點。",
    educationalNotes:
      "Roxadustat 為口服 HIF-PH 抑制劑（臨床用於腎性貧血），作用類似 EPO、提升攜氧能力，屬 S2 類。本案顯示運動員若能舉證污染來源與程度，可影響裁罰幅度。",
    additionalInfo: {
      legalProcess: "ITIA 初判 4 年 → CAS 2024 年 3 月減為 9 個月",
      substanceNote: "Roxadustat 為 HIF 活化劑，WADA 列於 S2 類",
    },
    createdAt: new Date(),
  },
  {
    athleteName: "Ryan Garcia (瑞恩·加西亞)",
    nationality: "美國",
    sport: "拳擊",
    substance: "Ostarine (SARM)",
    substanceCategory: "S1.2: 合成代謝劑（其他合成代謝劑）",
    year: 2024,
    eventBackground:
      "美國拳擊手 Ryan Garcia 在 2024 年 4 月對戰 Devin Haney 的賽事前後，經 VADA 檢出 ostarine（一種 SARM）陽性。紐約州運動委員會（NYSAC）判處 1 年禁賽（追溯自 2024 年 4 月 20 日）並處罰金，其對 Haney 的勝場改判為『無效判定』（No Contest）。",
    punishment: {
      banDuration: "1年（NYSAC，追溯自 2024 年 4 月 20 日）",
      resultsCancelled: true,
      medalStripped: false,
      otherPenalties: "對 Haney 之勝場改判無效判定（NC），並處罰金",
    },
    sourceLinks: [
      { title: "NYSAC Ruling", url: "https://dos.ny.gov/athletic-commission", type: "NYSAC" },
      { title: "VADA", url: "https://www.vada-testing.org/", type: "VADA" },
    ],
    summary:
      "SARM（ostarine）在職業拳擊的近期案例，凸顯賽果改判與商業拳賽藥檢的爭議。",
    educationalNotes:
      "Ostarine（enobosarm）為選擇性雄激素受體調節劑（SARM），屬 S1.2 其他合成代謝劑，微量亦可能來自受污染補充劑。",
    additionalInfo: {
      legalProcess: "NYSAC 聽證後判 1 年禁賽並改判賽果",
      substanceNote: "Ostarine 為非類固醇 SARM",
    },
    createdAt: new Date(),
  },
];

function getPath(obj, key) {
  return key.includes(".")
    ? key.split(".").reduce((o, p) => (o == null ? o : o[p]), obj)
    : obj[key];
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ 需要 MONGODB_URI 環境變數");
    process.exit(1);
  }
  const client = await MongoClient.connect(uri);
  const col = client.db(DB_NAME).collection("cases");

  console.log(
    `模式：${APPLY ? "APPLY（實際寫入）" : "DRY-RUN（只預覽，不寫入）"}\n`,
  );

  // 1) FIXES
  console.log(`【1】欄位更正 ${FIXES.length} 筆`);
  let fixed = 0;
  for (const f of FIXES) {
    let doc;
    try {
      doc = await col.findOne({ _id: new ObjectId(f.id) });
    } catch {
      doc = null;
    }
    if (!doc) {
      console.log(`  ⚠ 找不到 _id=${f.id}（${f.who}）— 略過`);
      continue;
    }
    console.log(`  ● ${f.who} — ${f.why}`);
    for (const [k, v] of Object.entries(f.set)) {
      console.log(`      ${k}: ${JSON.stringify(getPath(doc, k))} → ${JSON.stringify(v)}`);
    }
    if (APPLY) {
      await col.updateOne({ _id: new ObjectId(f.id) }, { $set: f.set });
      fixed++;
    }
  }

  // 2) DELETES
  console.log(`\n【2】刪除重複/錯置 ${DELETES.length} 筆`);
  let deleted = 0;
  for (const d of DELETES) {
    let doc;
    try {
      doc = await col.findOne({ _id: new ObjectId(d.id) });
    } catch {
      doc = null;
    }
    if (!doc) {
      console.log(`  ⚠ 找不到 _id=${d.id}（${d.who}）— 略過（可能已刪）`);
      continue;
    }
    console.log(`  ✗ 刪除：${d.who}｜保留：${d.keep}`);
    console.log(`      理由：${d.why}`);
    if (APPLY) {
      await col.deleteOne({ _id: new ObjectId(d.id) });
      deleted++;
    }
  }

  // 3) INSERTS
  console.log(`\n【3】新增近年案例 ${INSERTS.length} 筆`);
  let inserted = 0;
  for (const c of INSERTS) {
    const existing = await col.findOne({
      athleteName: c.athleteName,
      year: c.year,
    });
    if (existing) {
      console.log(`  ⚠ 已存在：${c.athleteName}（${c.year}）— 略過`);
      continue;
    }
    console.log(`  ＋ 新增：${c.athleteName}｜${c.sport}｜${c.substance}｜${c.year}｜${c.punishment.banDuration}`);
    if (APPLY) {
      await col.insertOne(c);
      inserted++;
    }
  }

  if (APPLY) {
    const total = await col.countDocuments();
    console.log(
      `\n完成：更新 ${fixed}、刪除 ${deleted}、新增 ${inserted}｜目前總數 ${total}`,
    );
  } else {
    console.log(`\nDRY-RUN 結束（未寫入）。確認無誤後加 --apply 執行。`);
  }
  await client.close();
}

main().catch((e) => {
  console.error("執行失敗：", e);
  process.exit(1);
});
