const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function exportCasesToMarkdown() {
  let client;
  
  try {
    client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('antidoping');
    
    console.log('正在從數據庫提取所有案例...');
    
    // 獲取所有案例，按年份降序排列
    const allCases = await db.collection('cases').find({}).sort({ year: -1, sport: 1 }).toArray();
    
    console.log(`找到 ${allCases.length} 個案例`);
    
    // 生成 Markdown 內容
    let markdown = generateMarkdownContent(allCases);
    
    // 寫入文件
    const outputPath = path.join(__dirname, '..', '運動禁藥案例資料庫_完整清單.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`✅ 已生成 Markdown 文件: ${outputPath}`);
    
    // 生成統計摘要
    generateStatsSummary(allCases);
    
  } catch (error) {
    console.error('❌ 導出過程中發生錯誤:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function generateMarkdownContent(cases) {
  const currentDate = new Date().toLocaleDateString('zh-TW');
  
  let markdown = `# 運動禁藥案例資料庫 - 完整清單

> **生成日期**: ${currentDate}  
> **總案例數**: ${cases.length}  
> **資料用途**: 教育研究與反禁藥宣導  

---

## 📋 目錄

- [統計摘要](#統計摘要)
- [按運動項目分類](#按運動項目分類)  
- [詳細案例清單](#詳細案例清單)
- [資料來源說明](#資料來源說明)

---

## 統計摘要

`;

  // 統計各運動項目
  const sportStats = {};
  const yearStats = {};
  const substanceStats = {};
  const nationalityStats = {};
  
  cases.forEach(case_ => {
    // 運動項目統計
    sportStats[case_.sport] = (sportStats[case_.sport] || 0) + 1;
    
    // 年份統計
    const decade = Math.floor(case_.year / 10) * 10;
    yearStats[`${decade}s`] = (yearStats[`${decade}s`] || 0) + 1;
    
    // 藥物分類統計
    const category = case_.substanceCategory || '未分類';
    substanceStats[category] = (substanceStats[category] || 0) + 1;
    
    // 國籍統計
    nationalityStats[case_.nationality] = (nationalityStats[case_.nationality] || 0) + 1;
  });
  
  // 按運動項目統計表格
  markdown += `### 🏆 各運動項目案例數

| 運動項目 | 案例數 | 百分比 |
|---------|-------|-------|
`;
  
  Object.entries(sportStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([sport, count]) => {
      const percentage = ((count / cases.length) * 100).toFixed(1);
      markdown += `| ${sport} | ${count} | ${percentage}% |\n`;
    });

  // 按年代統計
  markdown += `\n### 📅 各年代案例數

| 年代 | 案例數 | 百分比 |
|-----|-------|-------|
`;
  
  Object.entries(yearStats)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([decade, count]) => {
      const percentage = ((count / cases.length) * 100).toFixed(1);
      markdown += `| ${decade} | ${count} | ${percentage}% |\n`;
    });

  // 按藥物分類統計
  markdown += `\n### 💊 WADA禁藥分類統計

| WADA分類 | 案例數 | 百分比 |
|---------|-------|-------|
`;
  
  Object.entries(substanceStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percentage = ((count / cases.length) * 100).toFixed(1);
      markdown += `| ${category} | ${count} | ${percentage}% |\n`;
    });

  // 按國籍統計 (僅顯示前15名)
  markdown += `\n### 🌍 主要國籍案例數 (前15名)

| 國籍 | 案例數 | 百分比 |
|-----|-------|-------|
`;
  
  Object.entries(nationalityStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .forEach(([nationality, count]) => {
      const percentage = ((count / cases.length) * 100).toFixed(1);
      markdown += `| ${nationality} | ${count} | ${percentage}% |\n`;
    });

  markdown += `\n---\n\n## 按運動項目分類\n\n`;
  
  // 按運動項目分組
  const casesBySport = {};
  cases.forEach(case_ => {
    if (!casesBySport[case_.sport]) {
      casesBySport[case_.sport] = [];
    }
    casesBySport[case_.sport].push(case_);
  });
  
  Object.entries(casesBySport)
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([sport, sportCases]) => {
      markdown += `### ${sport} (${sportCases.length}個案例)\n\n`;
      sportCases.forEach(case_ => {
        markdown += `- **${case_.athleteName}** (${case_.year}) - ${case_.substance}\n`;
      });
      markdown += `\n`;
    });

  markdown += `\n---\n\n## 詳細案例清單\n\n`;
  
  // 詳細案例清單
  cases.forEach((case_, index) => {
    markdown += `### ${index + 1}. ${case_.athleteName} (${case_.year})

**基本資訊**
- **運動項目**: ${case_.sport}
- **國籍**: ${case_.nationality}  
- **年份**: ${case_.year}
- **禁用物質**: ${case_.substance}
- **WADA分類**: ${case_.substanceCategory}

**事件背景**
${case_.eventBackground}

**處罰措施**
- **禁賽期限**: ${case_.punishment.banDuration}
- **成績取消**: ${case_.punishment.resultsCancelled ? '是' : '否'}
- **獎牌剝奪**: ${case_.punishment.medalStripped ? '是' : '否'}
- **其他處罰**: ${case_.punishment.otherPenalties || '無'}

**案例摘要**
${case_.summary}

**教育重點**
${case_.educationalNotes}
`;

    // 資料來源
    if (case_.sourceLinks && case_.sourceLinks.length > 0) {
      markdown += `\n**資料來源**\n`;
      case_.sourceLinks.forEach(link => {
        markdown += `- [${link.title}](${link.url}) (${link.type})\n`;
      });
    }
    
    markdown += `\n---\n\n`;
  });
  
  // 資料來源說明
  markdown += `## 資料來源說明

### 主要參考來源

1. **WADA (World Anti-Doping Agency)**
   - 官方違規案例資料庫
   - 禁用清單和分類標準
   - https://www.wada-ama.org/

2. **各國反禁藥組織**
   - USADA (美國反禁藥機構)
   - UKADA (英國反禁藥機構)
   - 各國國家反禁藥組織公告

3. **國際體育組織**
   - IOC (國際奧委會)
   - FIFA (國際足球總會)
   - World Athletics (世界田徑)
   - ITF (國際網球總會)
   - MLB, NBA, NFL 等職業聯盟

4. **司法和調查報告**
   - BALCO 調查報告
   - 俄羅斯國家禁藥計劃報告
   - 各國司法部門起訴書

### 資料驗證說明

- 所有案例均基於公開的官方資料
- 優先採用一手官方來源
- 交叉驗證多個可靠來源
- 避免未經證實的傳聞或猜測
- 定期更新和修正資料

### 使用聲明

此資料庫僅供教育和研究用途，幫助了解運動禁藥問題的嚴重性和反禁藥工作的重要性。所有案例資料均來自公開來源，如有疑問請參考原始官方文件。

### 最後更新

**生成時間**: ${new Date().toLocaleString('zh-TW')}  
**資料庫版本**: v1.0  
**總案例數**: ${cases.length}

---

*本文件由運動禁藥案例教育平台自動生成*
`;
  
  return markdown;
}

function generateStatsSummary(cases) {
  console.log('\n📊 資料庫統計摘要:');
  console.log(`   總案例數: ${cases.length}`);
  
  const yearRange = {
    min: Math.min(...cases.map(c => c.year)),
    max: Math.max(...cases.map(c => c.year))
  };
  console.log(`   時間跨度: ${yearRange.min} - ${yearRange.max}`);
  
  const uniqueSports = [...new Set(cases.map(c => c.sport))].length;
  console.log(`   涵蓋運動項目: ${uniqueSports}`);
  
  const uniqueCountries = [...new Set(cases.map(c => c.nationality))].length;
  console.log(`   涵蓋國籍: ${uniqueCountries}`);
  
  const uniqueSubstances = [...new Set(cases.map(c => c.substanceCategory))].length;
  console.log(`   WADA分類: ${uniqueSubstances}`);
  
  // 最近案例
  const recentCases = cases.filter(c => c.year >= 2020);
  console.log(`   近5年案例: ${recentCases.length}`);
  
  // 知名案例
  const famousAthletes = ['Alex Rodriguez', 'Barry Bonds', 'Diego Maradona', 'Maria Sharapova', 'Lance Armstrong', 'Justin Gatlin'];
  const famousCasesCount = cases.filter(c => 
    famousAthletes.some(name => c.athleteName.includes(name))
  ).length;
  console.log(`   知名運動員案例: ${famousCasesCount}`);
}

// 執行導出
exportCasesToMarkdown();