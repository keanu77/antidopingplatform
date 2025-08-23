const mongoose = require('mongoose');
const Case = require('./models/Case');

// 連接資料庫
mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixProblematicCases() {
  try {
    console.log('🔧 開始處理有問題的案例...\n');
    
    let removedCount = 0;
    let updatedCount = 0;
    
    // ================================
    // 1. 移除非反禁藥相關案例
    // ================================
    
    console.log('📋 第一階段：移除非反禁藥相關案例');
    
    // 移除 Ja Morant - 屬於聯盟紀律處分，非反禁藥
    let jaCase = await Case.findOne({ athleteName: "Ja Morant", year: 2023 });
    if (jaCase) {
      console.log('❌ 移除 Ja Morant (2023) - 屬於NBA聯盟紀律處分，非反禁藥違規');
      await Case.deleteOne({ athleteName: "Ja Morant", year: 2023 });
      removedCount++;
    }
    
    // 移除 Brittney Griner - 屬於刑事案件，非體育反禁藥裁決
    let brittneyCase = await Case.findOne({ athleteName: "Brittney Griner", year: 2022 });
    if (brittneyCase) {
      console.log('❌ 移除 Brittney Griner (2022) - 屬於俄國刑事案件，非體育反禁藥裁決');
      await Case.deleteOne({ athleteName: "Brittney Griner", year: 2022 });
      removedCount++;
    }
    
    // 移除 Naim Süleymanoğlu - 無可信官方違規裁決記錄
    let naimCase = await Case.findOne({ athleteName: "Naim Süleymanoğlu", year: 2001 });
    if (naimCase) {
      console.log('❌ 移除 Naim Süleymanoğlu (2001) - 無可信官方違規裁決記錄');
      await Case.deleteOne({ athleteName: "Naim Süleymanoğlu", year: 2001 });
      removedCount++;
    }
    
    console.log(`✅ 第一階段完成，移除 ${removedCount} 個非反禁藥案例\\n`);
    
    // ================================
    // 2. 處理重複案例問題
    // ================================
    
    console.log('📋 第二階段：處理Sun Yang重複案例問題');
    
    // Sun Yang 有兩個案例，需要整合
    let sunYangCases = await Case.find({ athleteName: "Sun Yang" });
    console.log(`找到 Sun Yang 案例: ${sunYangCases.length} 個`);
    
    if (sunYangCases.length >= 2) {
      // 保留2014年的案例，但更新信息
      let case2014 = sunYangCases.find(c => c.year === 2014);
      if (case2014) {
        console.log('🔧 更新 Sun Yang (2014) 案例信息');
        await Case.updateOne(
          { _id: case2014._id },
          {
            $set: {
              eventBackground: "2014年Sun Yang因使用Trimetazidine被檢出陽性，2021年CAS重審此案並與2018年拒檢案合併處理。",
              punishment: {
                banDuration: "4年3個月（至2024-05-28）",
                resultsCancelled: true,
                medalStripped: false,
                otherPenalties: "2021年CAS最終裁決"
              },
              summary: "中國游泳名將的複雜禁藥案例，經過多次審理和上訴程序，最終由CAS作出終審判決。",
              educationalNotes: "此案展現了反禁藥程序的複雜性，以及運動員有權利進行申訴和重審的重要性。"
            }
          }
        );
        updatedCount++;
      }
      
      // 移除2018年的重複案例
      let case2018 = sunYangCases.find(c => c.year === 2018);
      if (case2018) {
        console.log('❌ 移除 Sun Yang (2018) 重複案例');
        await Case.deleteOne({ _id: case2018._id });
        removedCount++;
      }
    }
    
    console.log(`✅ 第二階段完成，處理重複案例\\n`);
    
    // ================================
    // 3. 修正錯誤信息案例
    // ================================
    
    console.log('📋 第三階段：修正錯誤信息案例');
    
    // Ryan Lochte - 確認描述正確（應該已經是正確的）
    let lochteCase = await Case.findOne({ athleteName: "Ryan Lochte", year: 2018 });
    if (lochteCase && lochteCase.substance.includes('Furosemide')) {
      console.log('🔧 修正 Ryan Lochte (2018) 物質描述');
      await Case.updateOne(
        { _id: lochteCase._id },
        {
          $set: {
            substance: "超量靜脈輸注",
            substanceCategory: "M2: 化學和物理操作",
            eventBackground: "2018年美國游泳選手Ryan Lochte因接受超過100ml的靜脈輸注而違反WADA規定，遭到禁賽。",
            educationalNotes: "超過100ml的靜脈輸注被禁止是因為可能被用來稀釋尿液中的禁藥濃度或快速改變血液成分。"
          }
        }
      );
      updatedCount++;
    }
    
    console.log(`✅ 第三階段完成\\n`);
    
    // ================================
    // 統計結果
    // ================================
    
    const totalCases = await Case.countDocuments();
    const totalSports = await Case.distinct('sport');
    const totalCountries = await Case.distinct('nationality');
    
    console.log('📊 清理和修正結果統計:');
    console.log(`   移除案例: ${removedCount}`);
    console.log(`   修正案例: ${updatedCount}`);
    console.log('');
    console.log('📊 修正後資料庫統計:');
    console.log(`   總案例數: ${totalCases}`);
    console.log(`   運動項目: ${totalSports.length}`);
    console.log(`   涵蓋國家: ${totalCountries.length}`);
    
    console.log('\\n✅ 案例品質改善完成！移除了非反禁藥案例，修正了錯誤信息。');
    
  } catch (error) {
    console.error('處理問題案例時發生錯誤:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixProblematicCases();