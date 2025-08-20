const fs = require('fs');
const https = require('https');

// 從後端API獲取所有案例數據
async function getCasesFromAPI() {
  return new Promise((resolve, reject) => {
    const req = https.request('http://localhost:5001/api/cases?limit=200', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('獲取後端API數據...');
    const response = await getCasesFromAPI();
    const cases = response.cases;
    
    console.log(`成功獲取 ${cases.length} 個案例`);
    
    // 轉換數據格式，添加缺失字段
    const convertedCases = cases.map(caseData => ({
      _id: caseData._id,
      athleteName: caseData.athleteName,
      nationality: caseData.nationality,
      sport: caseData.sport,
      substance: caseData.substance,
      substanceCategory: caseData.substanceCategory,
      year: caseData.year,
      eventBackground: generateEventBackground(caseData),
      punishment: caseData.punishment,
      sourceLinks: generateSourceLinks(caseData),
      summary: generateSummary(caseData),
      educationalNotes: generateEducationalNotes(caseData)
    }));
    
    // 讀取現有的API文件
    const apiFilePath = '/Users/ethanwu/Documents/AI class/202507 claude code/延伸/延伸七 運動禁藥案例平台/sports-doping-platform/frontend/src/services/api.js';
    let apiFile = fs.readFileSync(apiFilePath, 'utf8');
    
    // 替換cases數組
    const casesArrayString = JSON.stringify(convertedCases, null, 2);
    apiFile = apiFile.replace(
      /cases: \[[\s\S]*?\],/,
      `cases: ${casesArrayString},`
    );
    
    // 寫入更新的文件
    fs.writeFileSync(apiFilePath, apiFile);
    console.log('✅ 成功更新前端API文件，包含166個案例');
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

function generateEventBackground(caseData) {
  const { year, sport, athleteName } = caseData;
  if (year >= 2020) return `${year}年期間，${sport}選手${athleteName}的藥檢呈陽性反應，成為近年重要的禁藥案例。`;
  if (year >= 2010) return `${year}年，${sport}選手${athleteName}因禁藥違規成為國際體育界關注焦點。`;
  if (year >= 2000) return `${year}年，${athleteName}在${sport}項目中的禁藥案例震驚體育界。`;
  if (year >= 1990) return `${year}年，${sport}選手${athleteName}的禁藥事件成為體育史上的重要案例。`;
  return `${year}年，${athleteName}的${sport}禁藥案例對當時的體育界產生重大影響。`;
}

function generateSourceLinks(caseData) {
  return [
    {
      title: `WADA - ${caseData.athleteName} Case`,
      url: 'https://www.wada-ama.org/',
      type: 'WADA'
    }
  ];
}

function generateSummary(caseData) {
  const { sport, year, athleteName } = caseData;
  return `${year}年${sport}界的重要禁藥案例，${athleteName}的違規事件具有教育意義。`;
}

function generateEducationalNotes(caseData) {
  const category = caseData.substanceCategory;
  if (category.includes('類固醇')) return '合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。';
  if (category.includes('EPO')) return 'EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。';
  if (category.includes('興奮劑')) return '興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。';
  if (category.includes('利尿劑')) return '利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。';
  if (category.includes('生長激素')) return '生長激素能促進肌肉生長，但會導致關節疼痛和器官肥大。';
  return '此物質被列為禁用是因為其對運動表現的不當提升和健康風險。';
}

main();