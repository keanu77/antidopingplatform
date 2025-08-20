import axios from 'axios';

// 在生產環境中使用模擬數據，開發環境連接後端
const API_BASE_URL = import.meta.env.PROD ? null : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

const api = API_BASE_URL ? axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) : null;

// 模擬數據
const mockData = {
  cases: [
  {
    "_id": "68a32faa9962f293b0df6151",
    "athleteName": "Erriyon Knighton",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Trenbolone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2024,
    "eventBackground": "2024年期間，田徑選手Erriyon Knighton因使用Trenbolone被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "暫時禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "案件調查中"
    },
    "sourceLinks": [
      {
        "title": "WADA - Erriyon Knighton Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2024年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32faa9962f293b0df6153",
    "athleteName": "Iga Swiatek",
    "nationality": "波蘭",
    "sport": "網球",
    "substance": "Trimetazidine",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2024,
    "eventBackground": "2024年期間，網球選手Iga Swiatek因使用Trimetazidine被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "1個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "已服完禁賽期"
    },
    "sourceLinks": [
      {
        "title": "WADA - Iga Swiatek Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2024年網球界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Trimetazidine是心臟病藥物，被列為禁藥是因為可能提高運動表現。"
  },
  {
    "_id": "68a32faa9962f293b0df614d",
    "athleteName": "Jannik Sinner",
    "nationality": "義大利",
    "sport": "網球",
    "substance": "Clostebol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2024,
    "eventBackground": "2024年期間，網球選手Jannik Sinner因使用Clostebol被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "無禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "扣除印第安維爾斯大師賽積分和獎金"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jannik Sinner Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2024年網球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32faa9962f293b0df6159",
    "athleteName": "Ja Morant",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "大麻",
    "substanceCategory": "S6: 興奮劑",
    "year": 2023,
    "eventBackground": "2023年期間，籃球選手Ja Morant因使用大麻被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "25場比賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "NBA行為規範違反"
    },
    "sourceLinks": [
      {
        "title": "WADA - Ja Morant Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2023年籃球界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a32faa9962f293b0df6149",
    "athleteName": "Paul Pogba",
    "nationality": "法國",
    "sport": "足球",
    "substance": "Testosterone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2023,
    "eventBackground": "2023年期間，足球選手Paul Pogba因使用Testosterone被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯實質終結"
    },
    "sourceLinks": [
      {
        "title": "WADA - Paul Pogba Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2023年足球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a32faa9962f293b0df6155",
    "athleteName": "Brittney Griner",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "大麻",
    "substanceCategory": "S6: 興奮劑",
    "year": 2022,
    "eventBackground": "2022年期間，籃球選手Brittney Griner因使用大麻被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "無體育禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "俄羅斯法律制裁，後獲釋"
    },
    "sourceLinks": [
      {
        "title": "WADA - Brittney Griner Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2022年籃球界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a32faa9962f293b0df6157",
    "athleteName": "Fernando Tatis Jr.",
    "nationality": "多明尼加",
    "sport": "棒球",
    "substance": "Clostebol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2022,
    "eventBackground": "2022年期間，棒球選手Fernando Tatis Jr.因使用Clostebol被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "80場比賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "損失約290萬美元薪水"
    },
    "sourceLinks": [
      {
        "title": "WADA - Fernando Tatis Jr. Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2022年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32cef49e790566a3e640c",
    "athleteName": "Kamila Valieva",
    "nationality": "俄羅斯",
    "sport": "花式滑冰",
    "substance": "Trimetazidine",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2022,
    "eventBackground": "2022年期間，花式滑冰選手Kamila Valieva因使用Trimetazidine被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "從2021年12月25日起成績被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Kamila Valieva Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2022年花式滑冰界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Trimetazidine是心臟病藥物，被列為禁藥是因為可能提高運動表現。"
  },
  {
    "_id": "68a32cef49e790566a3e6418",
    "athleteName": "Simona Halep",
    "nationality": "羅馬尼亞",
    "sport": "網球",
    "substance": "Roxadustat",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2022,
    "eventBackground": "2022年期間，網球選手Simona Halep因使用Roxadustat被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "2022年7月起成績被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Simona Halep Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2022年網球界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a3624316b9b8aa03216e17",
    "athleteName": "Jennifer Thompson",
    "nationality": "美國",
    "sport": "健力",
    "substance": "Ostarine（污染）",
    "substanceCategory": "S1.2: 其他合成代謝劑",
    "year": 2021,
    "eventBackground": "2021年期間，健力選手Jennifer Thompson因使用Ostarine（污染）被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "警告",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "加強補充劑檢測"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jennifer Thompson Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2021年健力界的重要禁藥案例，展現了S1.2: 其他合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a33008177a2054dbdb597e",
    "athleteName": "Blessing Okagbare",
    "nationality": "奈及利亞",
    "sport": "田徑",
    "substance": "EPO, HGH",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2021,
    "eventBackground": "2021年期間，田徑選手Blessing Okagbare因使用EPO, HGH被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "10年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "職業生涯實質終結"
    },
    "sourceLinks": [
      {
        "title": "WADA - Blessing Okagbare Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2021年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a32faa9962f293b0df615b",
    "athleteName": "Sha'Carri Richardson",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "大麻",
    "substanceCategory": "S6: 興奮劑",
    "year": 2021,
    "eventBackground": "2021年期間，田徑選手Sha'Carri Richardson因使用大麻被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "1個月",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "錯過東京奧運100公尺比賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - Sha'Carri Richardson Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2021年田徑界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a32faa9962f293b0df6147",
    "athleteName": "Shelby Houlihan",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Nandrolone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2021,
    "eventBackground": "2021年期間，田徑選手Shelby Houlihan因使用Nandrolone被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "錯過東京奧運，美國紀錄被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Shelby Houlihan Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2021年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3624316b9b8aa03216e1c",
    "athleteName": "Hafþór Júlíus Björnsson",
    "nationality": "冰島",
    "sport": "大力士",
    "substance": "公開討論使用",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2020,
    "eventBackground": "2020年期間，大力士選手Hafþór Júlíus Björnsson因使用公開討論使用被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "無（非藥檢賽事）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無"
    },
    "sourceLinks": [
      {
        "title": "WADA - Hafþór Júlíus Björnsson Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2020年大力士界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a33465eb71405f787b5a92",
    "athleteName": "Christian Coleman",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "錯過檢測",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2020,
    "eventBackground": "2020年期間，田徑選手Christian Coleman因使用錯過檢測被檢出，成為近年重要的禁藥案例。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "錯過東京奧運會"
    },
    "sourceLinks": [
      {
        "title": "WADA - Christian Coleman Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2020年田徑界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a3661cafd8afd9004f73c5",
    "athleteName": "Adam Peaty",
    "nationality": "英國",
    "sport": "游泳",
    "substance": "Prednisolone (強體松)",
    "substanceCategory": "S9: 糖皮質激素",
    "year": 2019,
    "eventBackground": "2019年，游泳選手Adam Peaty因Prednisolone (強體松)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無"
    },
    "sourceLinks": [
      {
        "title": "WADA - Adam Peaty Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2019年游泳界的重要禁藥案例，展現了S9: 糖皮質激素類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a3624316b9b8aa03216e35",
    "athleteName": "Stefi Cohen",
    "nationality": "美國",
    "sport": "健力",
    "substance": "Cardarine（污染）",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2019,
    "eventBackground": "2019年，健力選手Stefi Cohen因Cardarine（污染）違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "6個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "加強教育"
    },
    "sourceLinks": [
      {
        "title": "WADA - Stefi Cohen Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年健力界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "代謝調節劑能影響新陳代謝和氧氣利用，但會對心臟造成負擔。"
  },
  {
    "_id": "68a3624316b9b8aa03216e0d",
    "athleteName": "Blaine Sumner",
    "nationality": "美國",
    "sport": "健力",
    "substance": "Testosterone（TUE）",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2019,
    "eventBackground": "2019年，健力選手Blaine Sumner因Testosterone（TUE）違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "引發爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Blaine Sumner Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年健力界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05d8",
    "athleteName": "John Collins",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "Growth Hormone Releasing Peptide-2",
    "substanceCategory": "S2.2: 生長激素",
    "year": 2019,
    "eventBackground": "2019年，籃球選手John Collins因Growth Hormone Releasing Peptide-2違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "25場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "錯過關鍵比賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - John Collins Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年籃球界的重要禁藥案例，展現了S2.2: 生長激素類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05d3",
    "athleteName": "Deandre Ayton",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "利尿劑",
    "substanceCategory": "S5: 利尿劑和掩蔽劑",
    "year": 2019,
    "eventBackground": "2019年，籃球選手Deandre Ayton因利尿劑違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "25場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "影響球隊戰績"
    },
    "sourceLinks": [
      {
        "title": "WADA - Deandre Ayton Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年籃球界的重要禁藥案例，展現了S5: 利尿劑和掩蔽劑類物質的危害。",
    "educationalNotes": "利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05ce",
    "athleteName": "Wilson Chandler",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "Ipamorelin",
    "substanceCategory": "S2.2: 生長激素",
    "year": 2019,
    "eventBackground": "2019年，籃球選手Wilson Chandler因Ipamorelin違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "25場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無薪假期"
    },
    "sourceLinks": [
      {
        "title": "WADA - Wilson Chandler Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年籃球界的重要禁藥案例，展現了S2.2: 生長激素類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a3394dc908b351f26ac6bb",
    "athleteName": "Wilson Kipsang",
    "nationality": "肯亞",
    "sport": "田徑",
    "substance": "Anti-Doping Rule Violations",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2019,
    "eventBackground": "2019年，田徑選手Wilson Kipsang因Anti-Doping Rule Violations違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "6年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "行蹤資訊造假"
    },
    "sourceLinks": [
      {
        "title": "WADA - Wilson Kipsang Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2019年田徑界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a33465eb71405f787b5ac8",
    "athleteName": "TJ Dillashaw",
    "nationality": "美國",
    "sport": "MMA/UFC",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2019,
    "eventBackground": "2019年，MMA/UFC選手TJ Dillashaw因EPO違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "主動交回冠軍腰帶"
    },
    "sourceLinks": [
      {
        "title": "WADA - TJ Dillashaw Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年MMA/UFC界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a32cef49e790566a3e6416",
    "athleteName": "Josh Gordon",
    "nationality": "美國",
    "sport": "美式足球",
    "substance": "大麻、酒精",
    "substanceCategory": "S6: 興奮劑",
    "year": 2019,
    "eventBackground": "2019年，美式足球選手Josh Gordon因大麻、酒精違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無限期停賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "多次復出又被禁賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - Josh Gordon Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2019年美式足球界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a3661cafd8afd9004f73b3",
    "athleteName": "Serena Williams",
    "nationality": "美國",
    "sport": "網球",
    "substance": "多種處方藥物",
    "substanceCategory": "TUE合法使用",
    "year": 2018,
    "eventBackground": "2018年，網球選手Serena Williams因多種處方藥物違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "隱私爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Serena Williams Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2018年網球界的重要禁藥案例，展現了TUE合法使用類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05ec",
    "athleteName": "Robinson Cano",
    "nationality": "多明尼加",
    "sport": "棒球",
    "substance": "Furosemide",
    "substanceCategory": "S5: 利尿劑和掩蔽劑",
    "year": 2018,
    "eventBackground": "2018年，棒球選手Robinson Cano因Furosemide違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "80場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "薪水損失約1200萬美元"
    },
    "sourceLinks": [
      {
        "title": "WADA - Robinson Cano Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2018年棒球界的重要禁藥案例，展現了S5: 利尿劑和掩蔽劑類物質的危害。",
    "educationalNotes": "利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。"
  },
  {
    "_id": "68a3376c5864b4762688890c",
    "athleteName": "Evgenia Medvedeva",
    "nationality": "俄羅斯",
    "sport": "花式滑冰",
    "substance": "Trimetazidine (疑似)",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2018,
    "eventBackground": "2018年，花式滑冰選手Evgenia Medvedeva因Trimetazidine (疑似)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "受俄羅斯整體禁令影響"
    },
    "sourceLinks": [
      {
        "title": "WADA - Evgenia Medvedeva Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2018年花式滑冰界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Trimetazidine是心臟病藥物，被列為禁藥是因為可能提高運動表現。"
  },
  {
    "_id": "68a33465eb71405f787b5a8e",
    "athleteName": "Sun Yang",
    "nationality": "中國",
    "sport": "游泳",
    "substance": "拒絕檢測",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2018,
    "eventBackground": "2014年全國游泳錦標賽藥檢陽性，後因破壞血檢樣本再次被禁賽。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "職業生涯實質結束"
    },
    "sourceLinks": [
      {
        "title": "WADA - Sun Yang Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2018年游泳界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a32faa9962f293b0df6143",
    "athleteName": "Canelo Alvarez",
    "nationality": "墨西哥",
    "sport": "拳擊",
    "substance": "Clenbuterol",
    "substanceCategory": "S3: Beta-2激動劑",
    "year": 2018,
    "eventBackground": "2018年，拳擊選手Canelo Alvarez因Clenbuterol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "6個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "二番戰延後舉行"
    },
    "sourceLinks": [
      {
        "title": "WADA - Canelo Alvarez Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2018年拳擊界的重要禁藥案例，展現了S3: Beta-2激動劑類物質的危害。",
    "educationalNotes": "Clenbuterol是支氣管擴張劑，也用於畜牧業，可能通過食物鏈進入人體。"
  },
  {
    "_id": "68a3661cafd8afd9004f73d7",
    "athleteName": "Justin Rose",
    "nationality": "英國",
    "sport": "高爾夫",
    "substance": "Anti-inflammatory (抗炎藥)",
    "substanceCategory": "S9: 糖皮質激素",
    "year": 2017,
    "eventBackground": "2017年，高爾夫選手Justin Rose因Anti-inflammatory (抗炎藥)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無"
    },
    "sourceLinks": [
      {
        "title": "WADA - Justin Rose Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2017年高爾夫界的重要禁藥案例，展現了S9: 糖皮質激素類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a3624316b9b8aa03216e21",
    "athleteName": "Eddie Hall",
    "nationality": "英國",
    "sport": "大力士",
    "substance": "公開承認使用",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2017,
    "eventBackground": "2017年，大力士選手Eddie Hall因公開承認使用違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無（非藥檢賽事）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "健康問題"
    },
    "sourceLinks": [
      {
        "title": "WADA - Eddie Hall Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2017年大力士界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05c9",
    "athleteName": "Joakim Noah",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "Ligandrol (LGD-4033)",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2017,
    "eventBackground": "2017年，籃球選手Joakim Noah因Ligandrol (LGD-4033)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "20場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "薪水損失"
    },
    "sourceLinks": [
      {
        "title": "WADA - Joakim Noah Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2017年籃球界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6b9",
    "athleteName": "Jemima Sumgong",
    "nationality": "肯亞",
    "sport": "田徑",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2017,
    "eventBackground": "2017年，田徑選手Jemima Sumgong因EPO違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jemima Sumgong Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2017年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a32faa9962f293b0df613d",
    "athleteName": "Jon Jones",
    "nationality": "美國",
    "sport": "MMA",
    "substance": "Turinabol (4-chlorodehydromethyltestosterone)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2017,
    "eventBackground": "2017年，MMA選手Jon Jones因Turinabol (4-chlorodehydromethyltestosterone)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "15個月",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "UFC 214勝利被改判為無效果"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jon Jones Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2017年MMA界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3661cafd8afd9004f73d1",
    "athleteName": "Lizzie Armitstead",
    "nationality": "英國",
    "sport": "自行車",
    "substance": "Prednisolone (強體松)",
    "substanceCategory": "S9: 糖皮質激素",
    "year": 2016,
    "eventBackground": "2016年，自行車選手Lizzie Armitstead因Prednisolone (強體松)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無"
    },
    "sourceLinks": [
      {
        "title": "WADA - Lizzie Armitstead Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年自行車界的重要禁藥案例，展現了S9: 糖皮質激素類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a3661cafd8afd9004f73bf",
    "athleteName": "Simone Biles",
    "nationality": "美國",
    "sport": "體操",
    "substance": "Methylphenidate (甲基苯丙胺)",
    "substanceCategory": "S6: 興奮劑",
    "year": 2016,
    "eventBackground": "2016年，體操選手Simone Biles因Methylphenidate (甲基苯丙胺)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "隱私侵犯"
    },
    "sourceLinks": [
      {
        "title": "WADA - Simone Biles Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年體操界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a3624316b9b8aa03216e3a",
    "athleteName": "Mikhail Koklyaev",
    "nationality": "俄羅斯",
    "sport": "舉重/大力士",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，舉重/大力士選手Mikhail Koklyaev因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "1年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "轉向非藥檢賽事"
    },
    "sourceLinks": [
      {
        "title": "WADA - Mikhail Koklyaev Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年舉重/大力士界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3624316b9b8aa03216df9",
    "athleteName": "Nijat Rahimov",
    "nationality": "哈薩克",
    "sport": "舉重",
    "substance": "Turinabol",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2016,
    "eventBackground": "2016年，舉重選手Nijat Rahimov因Turinabol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "世界紀錄被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Nijat Rahimov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年舉重界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05e7",
    "athleteName": "Dee Gordon",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "Testosterone和Clostebol",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2016,
    "eventBackground": "2016年，棒球選手Dee Gordon因Testosterone和Clostebol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "80場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "全明星資格被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Dee Gordon Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年棒球界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a3394dc908b351f26ac6bd",
    "athleteName": "Brock Lesnar",
    "nationality": "美國",
    "sport": "MMA/UFC",
    "substance": "Clomiphene",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，MMA/UFC選手Brock Lesnar因Clomiphene違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "1年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "UFC復出計劃取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Brock Lesnar Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年MMA/UFC界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "代謝調節劑能影響新陳代謝和氧氣利用，但會對心臟造成負擔。"
  },
  {
    "_id": "68a3394dc908b351f26ac6bf",
    "athleteName": "Frank Mir",
    "nationality": "美國",
    "sport": "MMA/UFC",
    "substance": "Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2016,
    "eventBackground": "2016年，MMA/UFC選手Frank Mir因Turinabol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "UFC職業生涯實質結束"
    },
    "sourceLinks": [
      {
        "title": "WADA - Frank Mir Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年MMA/UFC界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6c1",
    "athleteName": "Chad Mendes",
    "nationality": "美國",
    "sport": "MMA/UFC",
    "substance": "GHRP-6",
    "substanceCategory": "S2.2: 生長激素",
    "year": 2016,
    "eventBackground": "2016年，MMA/UFC選手Chad Mendes因GHRP-6違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "UFC合約被終止"
    },
    "sourceLinks": [
      {
        "title": "WADA - Chad Mendes Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年MMA/UFC界的重要禁藥案例，展現了S2.2: 生長激素類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a3376c5864b4762688890e",
    "athleteName": "Aliya Mustafina",
    "nationality": "俄羅斯",
    "sport": "體操",
    "substance": "Meldonium (疑似)",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，體操選手Aliya Mustafina因Meldonium (疑似)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "受國家禁令影響"
    },
    "sourceLinks": [
      {
        "title": "WADA - Aliya Mustafina Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年體操界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3376c5864b47626888910",
    "athleteName": "Svetlana Romashina",
    "nationality": "俄羅斯",
    "sport": "韻律泳",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，韻律泳選手Svetlana Romashina因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "使用時間在禁用前"
    },
    "sourceLinks": [
      {
        "title": "WADA - Svetlana Romashina Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年韻律泳界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3376c5864b476268888fe",
    "athleteName": "Sergey Shubenkov",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，田徑選手Sergey Shubenkov因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "處於IAAF俄羅斯禁令期間"
    },
    "sourceLinks": [
      {
        "title": "WADA - Sergey Shubenkov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年田徑界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3376c5864b47626888900",
    "athleteName": "Anastasia Zueva",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，田徑選手Anastasia Zueva因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "職業生涯受重創"
    },
    "sourceLinks": [
      {
        "title": "WADA - Anastasia Zueva Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年田徑界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3376c5864b47626888902",
    "athleteName": "Pavel Kulzhanov",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，田徑選手Pavel Kulzhanov因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "職業生涯實質結束"
    },
    "sourceLinks": [
      {
        "title": "WADA - Pavel Kulzhanov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年田徑界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3376c5864b47626888906",
    "athleteName": "Alexander Povetkin",
    "nationality": "俄羅斯",
    "sport": "拳擊",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，拳擊選手Alexander Povetkin因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "1年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "重要拳賽延期"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alexander Povetkin Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年拳擊界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3376c5864b476268888ee",
    "athleteName": "Elena Isinbaeva",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Meldonium (疑似)",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，田徑選手Elena Isinbaeva因Meldonium (疑似)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無直接處罰",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "退役避免進一步調查"
    },
    "sourceLinks": [
      {
        "title": "WADA - Elena Isinbaeva Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年田徑界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a33008177a2054dbdb597a",
    "athleteName": "Gil Roberts",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Probenecid",
    "substanceCategory": "S5: 利尿劑和掩蔽劑",
    "year": 2016,
    "eventBackground": "2016年，田徑選手Gil Roberts因Probenecid違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無 (獲得TUE)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "後續獲得治療用途豁免"
    },
    "sourceLinks": [
      {
        "title": "WADA - Gil Roberts Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年田徑界的重要禁藥案例，展現了S5: 利尿劑和掩蔽劑類物質的危害。",
    "educationalNotes": "利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。"
  },
  {
    "_id": "68a33008177a2054dbdb5978",
    "athleteName": "Therese Johaug",
    "nationality": "挪威",
    "sport": "越野滑雪",
    "substance": "Clostebol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2016,
    "eventBackground": "2016年，越野滑雪選手Therese Johaug因Clostebol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "18個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "錯過平昌冬奧"
    },
    "sourceLinks": [
      {
        "title": "WADA - Therese Johaug Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2016年越野滑雪界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32cef49e790566a3e6414",
    "athleteName": "Darya Klishina",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年，田徑選手Darya Klishina因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "暫時禁賽後撤銷",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "清白後恢復比賽資格"
    },
    "sourceLinks": [
      {
        "title": "WADA - Darya Klishina Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2016年田徑界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac5d",
    "athleteName": "Maria Sharapova",
    "nationality": "俄羅斯",
    "sport": "網球",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2016,
    "eventBackground": "2016年澳網期間藥檢呈陽性，聲稱不知道Meldonium已被列入禁藥清單。",
    "punishment": {
      "banDuration": "15個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "失去多個贊助合約"
    },
    "sourceLinks": [
      {
        "title": "WADA - Maria Sharapova Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "高知名度選手因未注意禁藥清單更新而違規的案例。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3661cafd8afd9004f73a7",
    "athleteName": "Mo Farah",
    "nationality": "英國",
    "sport": "田徑",
    "substance": "L-carnitine注射",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2015,
    "eventBackground": "2015年，田徑選手Mo Farah因L-carnitine注射違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "媒體質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Mo Farah Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2015年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a3624316b9b8aa03216e12",
    "athleteName": "Kirill Sarychev",
    "nationality": "俄羅斯",
    "sport": "健力",
    "substance": "公開使用（非藥檢聯盟）",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2015,
    "eventBackground": "2015年，健力選手Kirill Sarychev因公開使用（非藥檢聯盟）違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無（非藥檢聯盟）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無法參加IPF比賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - Kirill Sarychev Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2015年健力界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05e2",
    "athleteName": "Peyton Manning",
    "nationality": "美國",
    "sport": "美式足球",
    "substance": "HGH (指控)",
    "substanceCategory": "S2.2: 生長激素",
    "year": 2015,
    "eventBackground": "2015年，美式足球選手Peyton Manning因HGH (指控)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "聲譽受到質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Peyton Manning Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2015年美式足球界的重要禁藥案例，展現了S2.2: 生長激素類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a33465eb71405f787b5ad2",
    "athleteName": "Tyson Fury",
    "nationality": "英國",
    "sport": "拳擊",
    "substance": "Nandrolone (爭議)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2015,
    "eventBackground": "2015年，拳擊選手Tyson Fury因Nandrolone (爭議)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "追溯至2015年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "2年實質禁賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - Tyson Fury Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2015年拳擊界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32faa9962f293b0df613f",
    "athleteName": "俄羅斯田徑隊",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "系統性使用多種禁藥",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2015,
    "eventBackground": "2015年，田徑選手俄羅斯田徑隊因系統性使用多種禁藥違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2015-2021年國際賽事禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "里約奧運全面禁賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - 俄羅斯田徑隊 Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "俄羅斯系統性禁藥計劃的重要案例，影響國際體育治理。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32cef49e790566a3e6406",
    "athleteName": "Anderson Silva",
    "nationality": "巴西",
    "sport": "MMA",
    "substance": "Drostanolone",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2015,
    "eventBackground": "2015年，MMA選手Anderson Silva因Drostanolone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "1年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "罰款18萬美元"
    },
    "sourceLinks": [
      {
        "title": "WADA - Anderson Silva Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2015年MMA界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a35efe2d06dd0b2d189f64",
    "athleteName": "Alex Rodriguez (A-Rod)",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "Testosterone等多種",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2014,
    "eventBackground": "2014年，棒球選手Alex Rodriguez (A-Rod)因Testosterone等多種違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "整個2014年球季 (211場)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "損失約2500萬美元薪水"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alex Rodriguez (A-Rod) Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2014年棒球界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a3394dc908b351f26ac6b7",
    "athleteName": "Rita Jeptoo",
    "nationality": "肯亞",
    "sport": "田徑",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2014,
    "eventBackground": "2014年，田徑選手Rita Jeptoo因EPO違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "獎金被收回"
    },
    "sourceLinks": [
      {
        "title": "WADA - Rita Jeptoo Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2014年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a3376c5864b47626888908",
    "athleteName": "Eduard Latypov",
    "nationality": "俄羅斯",
    "sport": "冬季兩項",
    "substance": "系統性國家禁藥",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2014,
    "eventBackground": "2014年，冬季兩項選手Eduard Latypov因系統性國家禁藥違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "索契冬奧獎牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Eduard Latypov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2014年冬季兩項界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a3376c5864b4762688890a",
    "athleteName": "Evgeny Ustyugov",
    "nationality": "俄羅斯",
    "sport": "冬季兩項",
    "substance": "系統性國家禁藥",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2014,
    "eventBackground": "2014年，冬季兩項選手Evgeny Ustyugov因系統性國家禁藥違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "多個奧運獎牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Evgeny Ustyugov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2014年冬季兩項界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a3376c5864b476268888ea",
    "athleteName": "Alexander Legkov",
    "nationality": "俄羅斯",
    "sport": "越野滑雪",
    "substance": "系統性國家禁藥計劃",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2014,
    "eventBackground": "2014年，越野滑雪選手Alexander Legkov因系統性國家禁藥計劃違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "索契冬奧金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alexander Legkov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2014年越野滑雪界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a3376c5864b476268888ec",
    "athleteName": "Alexander Tretiakov",
    "nationality": "俄羅斯",
    "sport": "俯式冰橇",
    "substance": "系統性國家禁藥計劃",
    "substanceCategory": "M2: 化學和物理操作",
    "year": 2014,
    "eventBackground": "2014年，俯式冰橇選手Alexander Tretiakov因系統性國家禁藥計劃違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "索契冬奧金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alexander Tretiakov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2014年俯式冰橇界的重要禁藥案例，展現了M2: 化學和物理操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a33465eb71405f787b5a8a",
    "athleteName": "Russian State Doping System",
    "nationality": "俄羅斯",
    "sport": "多項目",
    "substance": "系統性國家禁藥",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2014,
    "eventBackground": "俄羅斯國家層面系統性禁藥計劃，影響多屆奧運會和世界大賽。",
    "punishment": {
      "banDuration": "4年集體禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "國際體育聲譽重創"
    },
    "sourceLinks": [
      {
        "title": "WADA - Russian State Doping System Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "俄羅斯系統性禁藥計劃的重要案例，影響國際體育治理。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a33008177a2054dbdb5980",
    "athleteName": "Park Tae-hwan",
    "nationality": "南韓",
    "sport": "游泳",
    "substance": "Testosterone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2014,
    "eventBackground": "2014年，游泳選手Park Tae-hwan因Testosterone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "18個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "幾乎錯過里約奧運"
    },
    "sourceLinks": [
      {
        "title": "WADA - Park Tae-hwan Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2014年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a32cef49e790566a3e640e",
    "athleteName": "Alex Rodriguez",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "睪固酮、HGH",
    "substanceCategory": "S2.2: 生長激素",
    "year": 2014,
    "eventBackground": "2014年，棒球選手Alex Rodriguez因睪固酮、HGH違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "整個2014球季",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "損失2400萬美元薪水"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alex Rodriguez Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2014年棒球界的重要禁藥案例，展現了S2.2: 生長激素類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac61",
    "athleteName": "Sun Yang",
    "nationality": "中國",
    "sport": "游泳",
    "substance": "Trimetazidine",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2014,
    "eventBackground": "2014年全國游泳錦標賽藥檢陽性，後因破壞血檢樣本再次被禁賽。",
    "punishment": {
      "banDuration": "3個月（2014年）、8年（2020年）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "2020年因破壞血檢樣本被重罰"
    },
    "sourceLinks": [
      {
        "title": "WADA - Sun Yang Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2014年游泳界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Trimetazidine是心臟病藥物，被列為禁藥是因為可能提高運動表現。"
  },
  {
    "_id": "68a3624216b9b8aa03216df1",
    "athleteName": "Hossein Rezazadeh",
    "nationality": "伊朗",
    "sport": "舉重",
    "substance": "Methandienone",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2013,
    "eventBackground": "2013年，舉重選手Hossein Rezazadeh因Methandienone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（已退役）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "聲譽受到質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Hossein Rezazadeh Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2013年舉重界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05bf",
    "athleteName": "Nelson Cruz",
    "nationality": "多明尼加",
    "sport": "棒球",
    "substance": "Testosterone",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2013,
    "eventBackground": "2013年，棒球選手Nelson Cruz因Testosterone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "50場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "錯過季後賽"
    },
    "sourceLinks": [
      {
        "title": "WADA - Nelson Cruz Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2013年棒球界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a35efe2d06dd0b2d189f6a",
    "athleteName": "Ryan Braun",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "Testosterone",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2013,
    "eventBackground": "2013年，棒球選手Ryan Braun因Testosterone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "65場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "放棄剩餘薪水約300萬美元"
    },
    "sourceLinks": [
      {
        "title": "WADA - Ryan Braun Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2013年棒球界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a3394dc908b351f26ac6b3",
    "athleteName": "Asafa Powell",
    "nationality": "牙買加",
    "sport": "田徑",
    "substance": "Oxilofrine",
    "substanceCategory": "S6: 興奮劑",
    "year": 2013,
    "eventBackground": "2013年，田徑選手Asafa Powell因Oxilofrine違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "18個月",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "職業生涯重創"
    },
    "sourceLinks": [
      {
        "title": "WADA - Asafa Powell Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2013年田徑界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a3394dc908b351f26ac6b5",
    "athleteName": "Veronica Campbell-Brown",
    "nationality": "牙買加",
    "sport": "田徑",
    "substance": "Hydrochlorothiazide",
    "substanceCategory": "S5: 利尿劑和掩蔽劑",
    "year": 2013,
    "eventBackground": "2013年，田徑選手Veronica Campbell-Brown因Hydrochlorothiazide違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "警告",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "被認定為非故意使用"
    },
    "sourceLinks": [
      {
        "title": "WADA - Veronica Campbell-Brown Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2013年田徑界的重要禁藥案例，展現了S5: 利尿劑和掩蔽劑類物質的危害。",
    "educationalNotes": "利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。"
  },
  {
    "_id": "68a3376c5864b476268888f0",
    "athleteName": "Yulia Stepanova",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "EPO, 類固醇",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2013,
    "eventBackground": "2013年，田徑選手Yulia Stepanova因EPO, 類固醇違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "成為關鍵告發者"
    },
    "sourceLinks": [
      {
        "title": "WADA - Yulia Stepanova Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2013年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac63",
    "athleteName": "Tyson Gay",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "合成代謝類固醇",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2013,
    "eventBackground": "2013年，田徑選手Tyson Gay因合成代謝類固醇違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "1年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "失去2012年奧運會4x100公尺接力銀牌"
    },
    "sourceLinks": [
      {
        "title": "WADA - Tyson Gay Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2013年田徑界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3661cafd8afd9004f73b9",
    "athleteName": "Bradley Wiggins",
    "nationality": "英國",
    "sport": "自行車",
    "substance": "Triamcinolone (曲安奈德)",
    "substanceCategory": "S9: 糖皮質激素",
    "year": 2012,
    "eventBackground": "2012年，自行車選手Bradley Wiggins因Triamcinolone (曲安奈德)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "道德爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Bradley Wiggins Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2012年自行車界的重要禁藥案例，展現了S9: 糖皮質激素類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a3661cafd8afd9004f73ad",
    "athleteName": "Rafael Nadal",
    "nationality": "西班牙",
    "sport": "網球",
    "substance": "Corticosteroid (皮質類固醇)",
    "substanceCategory": "S9: 糖皮質激素",
    "year": 2012,
    "eventBackground": "2012年，網球選手Rafael Nadal因Corticosteroid (皮質類固醇)違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "無"
    },
    "sourceLinks": [
      {
        "title": "WADA - Rafael Nadal Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2012年網球界的重要禁藥案例，展現了S9: 糖皮質激素類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a3394dc908b351f26ac6c3",
    "athleteName": "Besik Kudukhov",
    "nationality": "俄羅斯",
    "sport": "摔跤",
    "substance": "Meldonium",
    "substanceCategory": "S4.4: 代謝調節劑",
    "year": 2012,
    "eventBackground": "2012年，摔跤選手Besik Kudukhov因Meldonium違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "追溯處罰",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Besik Kudukhov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2012年摔跤界的重要禁藥案例，展現了S4.4: 代謝調節劑類物質的危害。",
    "educationalNotes": "Meldonium原用於治療心臟疾病，2016年被WADA列入禁藥，可能提高運動耐力。"
  },
  {
    "_id": "68a3394dc908b351f26ac6c5",
    "athleteName": "Sharif Sharifov",
    "nationality": "亞塞拜然",
    "sport": "摔跤",
    "substance": "Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2012,
    "eventBackground": "2012年，摔跤選手Sharif Sharifov因Turinabol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Sharif Sharifov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2012年摔跤界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6a7",
    "athleteName": "Ilya Ilyin",
    "nationality": "哈薩克",
    "sport": "舉重",
    "substance": "Stanozolol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2012,
    "eventBackground": "2012年，舉重選手Ilya Ilyin因Stanozolol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "兩屆奧運金牌全部被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Ilya Ilyin Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2012年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6a9",
    "athleteName": "Zulfiya Chinshanlo",
    "nationality": "哈薩克",
    "sport": "舉重",
    "substance": "Stanozolol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2012,
    "eventBackground": "2012年，舉重選手Zulfiya Chinshanlo因Stanozolol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Zulfiya Chinshanlo Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2012年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6ab",
    "athleteName": "Maiya Maneza",
    "nationality": "哈薩克",
    "sport": "舉重",
    "substance": "Stanozolol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2012,
    "eventBackground": "2012年，舉重選手Maiya Maneza因Stanozolol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Maiya Maneza Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2012年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6a5",
    "athleteName": "Nizami Pashayev",
    "nationality": "亞塞拜然",
    "sport": "舉重",
    "substance": "Stanozolol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2012,
    "eventBackground": "2012年，舉重選手Nizami Pashayev因Stanozolol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Nizami Pashayev Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2012年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。"
  },
  {
    "_id": "68a3376c5864b476268888f2",
    "athleteName": "Sergey Kirdyapkin",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2012,
    "eventBackground": "2012年，田徑選手Sergey Kirdyapkin因EPO違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "3年2個月",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Sergey Kirdyapkin Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2012年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a3376c5864b476268888f4",
    "athleteName": "Elena Lashmanova",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2012,
    "eventBackground": "2012年，田徑選手Elena Lashmanova因EPO違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Elena Lashmanova Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2012年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac5b",
    "athleteName": "Lance Armstrong",
    "nationality": "美國",
    "sport": "自行車",
    "substance": "EPO、睪固酮、皮質類固醇",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2012,
    "eventBackground": "七屆環法自行車賽冠軍，長期使用禁藥並領導團隊系統性作弊。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "剝奪1998年後所有成績，包括7個環法冠軍"
    },
    "sourceLinks": [
      {
        "title": "WADA - Lance Armstrong Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "自行車史上最大的禁藥醜聞，揭露了職業自行車界的系統性問題。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a3661cafd8afd9004f73cb",
    "athleteName": "Venus Williams",
    "nationality": "美國",
    "sport": "網球",
    "substance": "自體免疫疾病藥物",
    "substanceCategory": "TUE合法使用",
    "year": 2011,
    "eventBackground": "2011年，網球選手Venus Williams因自體免疫疾病藥物違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "無處罰（合法TUE）",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "健康挑戰"
    },
    "sourceLinks": [
      {
        "title": "WADA - Venus Williams Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "ITF",
        "url": "https://www.itftennis.com/",
        "type": "官方文件"
      }
    ],
    "summary": "2011年網球界的重要禁藥案例，展現了TUE合法使用類物質的危害。",
    "educationalNotes": "此物質被列為禁用是因為其對運動表現的不當提升和潛在健康風險。"
  },
  {
    "_id": "68a3376c5864b476268888fc",
    "athleteName": "Ekaterina Poistogova",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Testosterone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2011,
    "eventBackground": "2011年，田徑選手Ekaterina Poistogova因Testosterone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運銅牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Ekaterina Poistogova Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2011年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a3376c5864b476268888fa",
    "athleteName": "Mariya Savinova",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "Testosterone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2011,
    "eventBackground": "2011年，田徑選手Mariya Savinova因Testosterone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Mariya Savinova Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2011年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a33008177a2054dbdb5988",
    "athleteName": "LaShawn Merritt",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "DHEA, Pregnenolone",
    "substanceCategory": "S1.2: 其他合成代謝劑",
    "year": 2010,
    "eventBackground": "2010年，田徑選手LaShawn Merritt因DHEA, Pregnenolone違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "21個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "減刑因配合調查"
    },
    "sourceLinks": [
      {
        "title": "WADA - LaShawn Merritt Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2010年田徑界的重要禁藥案例，展現了S1.2: 其他合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac65",
    "athleteName": "Alberto Contador",
    "nationality": "西班牙",
    "sport": "自行車",
    "substance": "Clenbuterol",
    "substanceCategory": "S3: Beta-2激動劑",
    "year": 2010,
    "eventBackground": "2010年，自行車選手Alberto Contador因Clenbuterol違規成為國際體育界關注焦點。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "失去2010年環法冠軍和2011年環義冠軍"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alberto Contador Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2010年自行車界的重要禁藥案例，展現了S3: Beta-2激動劑類物質的危害。",
    "educationalNotes": "Clenbuterol是支氣管擴張劑，也用於畜牧業，可能通過食物鏈進入人體。"
  },
  {
    "_id": "68a35f27717bc6bd7adf05ba",
    "athleteName": "Manny Ramirez",
    "nationality": "多明尼加",
    "sport": "棒球",
    "substance": "HCG (人類絨毛膜促性腺激素)",
    "substanceCategory": "S2.2: 生長激素",
    "year": 2009,
    "eventBackground": "2009年，Manny Ramirez在棒球項目中因HCG (人類絨毛膜促性腺激素)的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "50場禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "第二次違規後退休"
    },
    "sourceLinks": [
      {
        "title": "WADA - Manny Ramirez Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2009年棒球界的重要禁藥案例，展現了S2.2: 生長激素類物質的危害。",
    "educationalNotes": "EPO和生長激素能提高運動表現，但會增加血栓、中風和器官肥大風險。"
  },
  {
    "_id": "68a3376c5864b476268888f6",
    "athleteName": "Olga Kaniskina",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2009,
    "eventBackground": "2009年，Olga Kaniskina在田徑項目中因EPO的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "3年2個月",
      "resultsCancelled": true,
      "medalStripped": true
    },
    "sourceLinks": [
      {
        "title": "WADA - Olga Kaniskina Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2009年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a3376c5864b476268888f8",
    "athleteName": "Valeriy Borchin",
    "nationality": "俄羅斯",
    "sport": "田徑",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2009,
    "eventBackground": "2009年，Valeriy Borchin在田徑項目中因EPO的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "北京奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Valeriy Borchin Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2009年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a33008177a2054dbdb5982",
    "athleteName": "Claudia Pechstein",
    "nationality": "德國",
    "sport": "競速滑冰",
    "substance": "Blood Doping (指控)",
    "substanceCategory": "M1: 血液和血液成分操作",
    "year": 2009,
    "eventBackground": "2009年，Claudia Pechstein在競速滑冰項目中因Blood Doping (指控)的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "損失2010溫哥華冬奧"
    },
    "sourceLinks": [
      {
        "title": "WADA - Claudia Pechstein Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2009年競速滑冰界的重要禁藥案例，展現了M1: 血液和血液成分操作類物質的危害。",
    "educationalNotes": "物理和化學操作違反了公平競爭原則，對運動員健康造成未知風險。"
  },
  {
    "_id": "68a32cef49e790566a3e6412",
    "athleteName": "Rashard Lewis",
    "nationality": "美國",
    "sport": "籃球",
    "substance": "睪固酮",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2009,
    "eventBackground": "2009年，Rashard Lewis在籃球項目中因睪固酮的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "10場比賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "成為NBA首位因類固醇被禁賽的球員"
    },
    "sourceLinks": [
      {
        "title": "WADA - Rashard Lewis Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2009年籃球界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a3394dc908b351f26ac6ad",
    "athleteName": "Svetlana Podobedova",
    "nationality": "哈薩克",
    "sport": "舉重",
    "substance": "Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2008,
    "eventBackground": "2008年，Svetlana Podobedova在舉重項目中因Turinabol的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "北京奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Svetlana Podobedova Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2008年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6af",
    "athleteName": "Apti Aukhadov",
    "nationality": "俄羅斯",
    "sport": "舉重",
    "substance": "Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2008,
    "eventBackground": "2008年，Apti Aukhadov在舉重項目中因Turinabol的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "北京奧運銀牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Apti Aukhadov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2008年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac69d",
    "athleteName": "Pyrros Dimas",
    "nationality": "希臘",
    "sport": "舉重",
    "substance": "Nandrolone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2008,
    "eventBackground": "2008年，Pyrros Dimas在舉重項目中因Nandrolone的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "退出北京奧運"
    },
    "sourceLinks": [
      {
        "title": "WADA - Pyrros Dimas Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2008年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6a1",
    "athleteName": "Dmitry Lapikov",
    "nationality": "俄羅斯",
    "sport": "舉重",
    "substance": "Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2008,
    "eventBackground": "2008年，Dmitry Lapikov在舉重項目中因Turinabol的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "北京奧運銀牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Dmitry Lapikov Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2008年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac6a3",
    "athleteName": "Oxana Slivenko",
    "nationality": "俄羅斯",
    "sport": "舉重",
    "substance": "Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2008,
    "eventBackground": "2008年，Oxana Slivenko在舉重項目中因Turinabol的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "北京奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Oxana Slivenko Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2008年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a330b62b645feb5c128cb7",
    "athleteName": "Antonio Pettigrew",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "PED cocktail",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2008,
    "eventBackground": "2008年，Antonio Pettigrew在田徑項目中因PED cocktail的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "追溯性處罰",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "美國隊交回奧運金牌"
    },
    "sourceLinks": [
      {
        "title": "WADA - Antonio Pettigrew Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2008年田徑界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac5f",
    "athleteName": "Marion Jones",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG (Tetrahydrogestrinone)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2007,
    "eventBackground": "2000年雪梨奧運會獲得5面獎牌，後承認使用禁藥。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "因作偽證被判入獄6個月"
    },
    "sourceLinks": [
      {
        "title": "WADA - Marion Jones Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2007年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a3624316b9b8aa03216dfe",
    "athleteName": "Tatiana Kashirina",
    "nationality": "俄羅斯",
    "sport": "舉重",
    "substance": "Oxandrolone",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2006,
    "eventBackground": "2006年，Tatiana Kashirina在舉重項目中因Oxandrolone的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "錯過北京奧運"
    },
    "sourceLinks": [
      {
        "title": "WADA - Tatiana Kashirina Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2006年舉重界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3394dc908b351f26ac69f",
    "athleteName": "Hossein Rezazadeh",
    "nationality": "伊朗",
    "sport": "舉重",
    "substance": "Stanozolol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2006,
    "eventBackground": "2006年，Hossein Rezazadeh在舉重項目中因Stanozolol的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "亞運會資格被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Hossein Rezazadeh Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2006年舉重界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac67",
    "athleteName": "Justin Gatlin",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "睪固酮",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2006,
    "eventBackground": "2006年，Justin Gatlin在田徑項目中因睪固酮的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "原判8年後減為4年"
    },
    "sourceLinks": [
      {
        "title": "WADA - Justin Gatlin Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2006年田徑界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a330b62b645feb5c128caf",
    "athleteName": "Tim Montgomery",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG, EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2005,
    "eventBackground": "2005年，Tim Montgomery在田徑項目中因THG, EPO的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "世界紀錄被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Tim Montgomery Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2005年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a333534fc3379f14adf605",
    "athleteName": "Bobby Estalella",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Bobby Estalella在棒球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯結束"
    },
    "sourceLinks": [
      {
        "title": "WADA - Bobby Estalella Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf607",
    "athleteName": "Marvin Benard",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Marvin Benard在棒球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "有限影響"
    },
    "sourceLinks": [
      {
        "title": "WADA - Marvin Benard Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf609",
    "athleteName": "Bill Romanowski",
    "nationality": "美國",
    "sport": "美式足球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Bill Romanowski在美式足球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "退役後承認"
    },
    "sourceLinks": [
      {
        "title": "WADA - Bill Romanowski Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年美式足球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf60b",
    "athleteName": "Dana Stubblefield",
    "nationality": "美國",
    "sport": "美式足球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Dana Stubblefield在美式足球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "獎項受質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Dana Stubblefield Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年美式足球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf60d",
    "athleteName": "Tyrone Wheatley",
    "nationality": "美國",
    "sport": "美式足球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Tyrone Wheatley在美式足球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業聲譽受損"
    },
    "sourceLinks": [
      {
        "title": "WADA - Tyrone Wheatley Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年美式足球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf60f",
    "athleteName": "Barrett Robbins",
    "nationality": "美國",
    "sport": "美式足球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Barrett Robbins在美式足球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯困擾"
    },
    "sourceLinks": [
      {
        "title": "WADA - Barrett Robbins Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年美式足球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf611",
    "athleteName": "Chris Cooper",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Chris Cooper在田徑項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "職業生涯終結"
    },
    "sourceLinks": [
      {
        "title": "WADA - Chris Cooper Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf613",
    "athleteName": "Chryste Gaines",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Chryste Gaines在田徑項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "奧運金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Chryste Gaines Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf615",
    "athleteName": "Michelle Collins",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG, EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2003,
    "eventBackground": "2003年，Michelle Collins在田徑項目中因THG, EPO的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "8年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "職業生涯實質終結"
    },
    "sourceLinks": [
      {
        "title": "WADA - Michelle Collins Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a333534fc3379f14adf617",
    "athleteName": "Alvin Harrison",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Alvin Harrison在田徑項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "接力隊金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alvin Harrison Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf619",
    "athleteName": "Calvin Harrison",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Calvin Harrison在田徑項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "兄弟檔同時違規"
    },
    "sourceLinks": [
      {
        "title": "WADA - Calvin Harrison Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf5f9",
    "athleteName": "Barry Bonds",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG, The Cream",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Barry Bonds在棒球項目中因THG, The Cream的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無官方禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "名人堂入選受阻"
    },
    "sourceLinks": [
      {
        "title": "WADA - Barry Bonds Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf5fb",
    "athleteName": "Jason Giambi",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG, 類固醇",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Jason Giambi在棒球項目中因THG, 類固醇的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無官方禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "公開道歉"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jason Giambi Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf5fd",
    "athleteName": "Gary Sheffield",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG (聲稱不知情)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Gary Sheffield在棒球項目中因THG (聲稱不知情)的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "聲譽受損"
    },
    "sourceLinks": [
      {
        "title": "WADA - Gary Sheffield Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf5ff",
    "athleteName": "Jeremy Giambi",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Jeremy Giambi在棒球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯提早結束"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jeremy Giambi Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf601",
    "athleteName": "Armando Rios",
    "nationality": "美國",
    "sport": "棒球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Armando Rios在棒球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯影響"
    },
    "sourceLinks": [
      {
        "title": "WADA - Armando Rios Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf603",
    "athleteName": "Benito Santiago",
    "nationality": "波多黎各",
    "sport": "棒球",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Benito Santiago在棒球項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "聲譽受損"
    },
    "sourceLinks": [
      {
        "title": "WADA - Benito Santiago Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年棒球界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a333534fc3379f14adf5f5",
    "athleteName": "Patrick Arnold",
    "nationality": "美國",
    "sport": "化學家",
    "substance": "THG設計者",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Patrick Arnold在化學家項目中因THG設計者的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "3個月監禁",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "禁藥化學設計的里程碑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Patrick Arnold Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年化學家界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a330b62b645feb5c128cab",
    "athleteName": "Kelli White",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Modafinil",
    "substanceCategory": "S6: 興奮劑",
    "year": 2003,
    "eventBackground": "2003年，Kelli White在田徑項目中因Modafinil的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "配合調查減刑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Kelli White Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a330b62b645feb5c128cb1",
    "athleteName": "Regina Jacobs",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Regina Jacobs在田徑項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "終結輝煌職業生涯"
    },
    "sourceLinks": [
      {
        "title": "WADA - Regina Jacobs Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a330b62b645feb5c128ca1",
    "athleteName": "BALCO案例群體",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "THG, EPO, 類固醇",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 2003,
    "eventBackground": "2003年，BALCO案例群體在田徑項目中因THG, EPO, 類固醇的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "各不相同",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "改變美國反禁藥歷史"
    },
    "sourceLinks": [
      {
        "title": "WADA - BALCO案例群體 Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a330b62b645feb5c128ca9",
    "athleteName": "Dwain Chambers",
    "nationality": "英國",
    "sport": "田徑",
    "substance": "THG",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2003,
    "eventBackground": "2003年，Dwain Chambers在田徑項目中因THG的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "英國奧委會終身禁令（後撤銷）"
    },
    "sourceLinks": [
      {
        "title": "WADA - Dwain Chambers Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2003年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "THG是專門設計來逃避檢測的「設計類固醇」，顯示禁藥技術的演進。"
  },
  {
    "_id": "68a32cef49e790566a3e6408",
    "athleteName": "Shane Warne",
    "nationality": "澳洲",
    "sport": "板球",
    "substance": "Diuretic",
    "substanceCategory": "S5: 利尿劑和掩蔽劑",
    "year": 2003,
    "eventBackground": "2003年，Shane Warne在板球項目中因Diuretic的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "12個月",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "錯過2003年世界盃"
    },
    "sourceLinks": [
      {
        "title": "WADA - Shane Warne Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2003年板球界的重要禁藥案例，展現了S5: 利尿劑和掩蔽劑類物質的危害。",
    "educationalNotes": "利尿劑常用於掩蔽其他禁藥，同時會影響電解質平衡。"
  },
  {
    "_id": "68a3624316b9b8aa03216e03",
    "athleteName": "Naim Süleymanoğlu",
    "nationality": "土耳其",
    "sport": "舉重",
    "substance": "Nandrolone",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 2001,
    "eventBackground": "2001年，Naim Süleymanoğlu在舉重項目中因Nandrolone的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "無正式處罰",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "死後聲譽受爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Naim Süleymanoğlu Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "2001年舉重界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a330b62b645feb5c128cb3",
    "athleteName": "CJ Hunter",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Nandrolone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 2000,
    "eventBackground": "2000年，CJ Hunter在田徑項目中因Nandrolone的禁藥案例震驚體育界。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "職業生涯終結"
    },
    "sourceLinks": [
      {
        "title": "WADA - CJ Hunter Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "2000年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42b7",
    "athleteName": "Jesus Manzano",
    "nationality": "西班牙",
    "sport": "自行車",
    "substance": "EPO, 類固醇",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1999,
    "eventBackground": "1999年，自行車選手Jesus Manzano使用EPO, 類固醇的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "無正式處罰",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "成為告發者"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jesus Manzano Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1999年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42a7",
    "athleteName": "Marco Pantani",
    "nationality": "義大利",
    "sport": "自行車",
    "substance": "EPO (疑似)",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1999,
    "eventBackground": "1999年，自行車選手Marco Pantani使用EPO (疑似)的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "無正式禁賽",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯毀滅，後來早逝"
    },
    "sourceLinks": [
      {
        "title": "WADA - Marco Pantani Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1999年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a330b62b645feb5c128cb5",
    "athleteName": "Jerome Young",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Nandrolone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1999,
    "eventBackground": "1999年，田徑選手Jerome Young使用Nandrolone的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "終身禁賽",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "美國接力隊失去奧運金牌"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jerome Young Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1999年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42ab",
    "athleteName": "Alex Zülle",
    "nationality": "瑞士",
    "sport": "自行車",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1998,
    "eventBackground": "1998年，自行車選手Alex Zülle使用EPO的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "7個月",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "提早承認獲減刑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Alex Zülle Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1998年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42ad",
    "athleteName": "Laurent Brochard",
    "nationality": "法國",
    "sport": "自行車",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1998,
    "eventBackground": "1998年，自行車選手Laurent Brochard使用EPO的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "6個月",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "世界冠軍頭銜保留"
    },
    "sourceLinks": [
      {
        "title": "WADA - Laurent Brochard Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1998年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42a9",
    "athleteName": "Richard Virenque",
    "nationality": "法國",
    "sport": "自行車",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1998,
    "eventBackground": "1998年，自行車選手Richard Virenque使用EPO的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "9個月",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "法國英雄形象破滅"
    },
    "sourceLinks": [
      {
        "title": "WADA - Richard Virenque Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1998年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae429b",
    "athleteName": "Festina車隊",
    "nationality": "法國",
    "sport": "自行車",
    "substance": "EPO, 生長激素, 類固醇",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1998,
    "eventBackground": "1998年，自行車選手Festina車隊使用EPO, 生長激素, 類固醇的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "車隊解散",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "改變環法賽歷史"
    },
    "sourceLinks": [
      {
        "title": "WADA - Festina車隊 Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1998年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a330b62b645feb5c128ca3",
    "athleteName": "Michelle Smith",
    "nationality": "愛爾蘭",
    "sport": "游泳",
    "substance": "Androstenedione (疑似)",
    "substanceCategory": "S1.2: 其他合成代謝劑",
    "year": 1998,
    "eventBackground": "1998年，游泳選手Michelle Smith使用Androstenedione (疑似)的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "奧運金牌保留但備受爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Michelle Smith Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1998年游泳界的重要禁藥案例，展現了S1.2: 其他合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a33008177a2054dbdb5986",
    "athleteName": "Dennis Mitchell",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Testosterone (歷史案例)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1998,
    "eventBackground": "1998年，田徑選手Dennis Mitchell使用Testosterone (歷史案例)的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": false,
      "otherPenalties": "辯護被廣泛嘲笑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Dennis Mitchell Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1998年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42a5",
    "athleteName": "Jan Ullrich",
    "nationality": "德國",
    "sport": "自行車",
    "substance": "EPO, 血液禁藥",
    "substanceCategory": "M1: 血液和血液成分操作",
    "year": 1997,
    "eventBackground": "1997年，自行車選手Jan Ullrich使用EPO, 血液禁藥的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "2年 (2006年)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "職業生涯蒙陰影"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jan Ullrich Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1997年自行車界的重要禁藥案例，展現了M1: 血液和血液成分操作類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42b5",
    "athleteName": "Erwan Menthéour",
    "nationality": "法國",
    "sport": "自行車",
    "substance": "EPO, 類固醇",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1996,
    "eventBackground": "1996年，自行車選手Erwan Menthéour使用EPO, 類固醇的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "無 (退役後承認)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "成為反禁藥教育者"
    },
    "sourceLinks": [
      {
        "title": "WADA - Erwan Menthéour Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1996年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42a3",
    "athleteName": "Bjarne Riis",
    "nationality": "丹麥",
    "sport": "自行車",
    "substance": "EPO",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1996,
    "eventBackground": "1996年，自行車選手Bjarne Riis使用EPO的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "追溯性道德譴責",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "保留環法冠軍但受道德質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Bjarne Riis Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1996年自行車界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42bd",
    "athleteName": "Michele Ferrari",
    "nationality": "義大利",
    "sport": "科學支援",
    "substance": "EPO, 血液禁藥",
    "substanceCategory": "M1: 血液和血液成分操作",
    "year": 1995,
    "eventBackground": "1995年，科學支援選手Michele Ferrari使用EPO, 血液禁藥的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "終身禁入體育界",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "多次法律訴訟"
    },
    "sourceLinks": [
      {
        "title": "WADA - Michele Ferrari Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "1995年科學支援界的重要禁藥案例，展現了M1: 血液和血液成分操作類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42b3",
    "athleteName": "Luc Leblanc",
    "nationality": "法國",
    "sport": "自行車",
    "substance": "Amphetamines",
    "substanceCategory": "S6: 興奮劑",
    "year": 1994,
    "eventBackground": "1994年，自行車選手Luc Leblanc使用Amphetamines的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "追溯性道德譴責",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "退役後承認"
    },
    "sourceLinks": [
      {
        "title": "WADA - Luc Leblanc Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "UCI",
        "url": "https://www.uci.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1994年自行車界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a332ee79b7dc9aedae429d",
    "athleteName": "中國女子游泳隊",
    "nationality": "中國",
    "sport": "游泳",
    "substance": "DHT (雙氫睪固酮)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1994,
    "eventBackground": "1994年，游泳選手中國女子游泳隊使用DHT (雙氫睪固酮)的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "2-4年不等",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "中國游泳聲譽重創"
    },
    "sourceLinks": [
      {
        "title": "WADA - 中國女子游泳隊 Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1994年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a332ee79b7dc9aedae429f",
    "athleteName": "Yuan Yuan",
    "nationality": "中國",
    "sport": "游泳",
    "substance": "DHT",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1994,
    "eventBackground": "1994年，游泳選手Yuan Yuan使用DHT的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "世錦賽金牌被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Yuan Yuan Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1994年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42a1",
    "athleteName": "Lu Bin",
    "nationality": "中國",
    "sport": "游泳",
    "substance": "DHT",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1994,
    "eventBackground": "1994年，游泳選手Lu Bin使用DHT的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "4年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "亞運會成績全部取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Lu Bin Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1994年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a332ee79b7dc9aedae42bb",
    "athleteName": "Francesco Conconi",
    "nationality": "義大利",
    "sport": "科學支援",
    "substance": "EPO研發應用",
    "substanceCategory": "S2.1: 促紅血球生成素類",
    "year": 1990,
    "eventBackground": "1990年，科學支援選手Francesco Conconi使用EPO研發應用的禁藥事件成為體育史上的重要案例。",
    "punishment": {
      "banDuration": "學術聲譽受損",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "被體育界封殺"
    },
    "sourceLinks": [
      {
        "title": "WADA - Francesco Conconi Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      }
    ],
    "summary": "1990年科學支援界的重要禁藥案例，展現了S2.1: 促紅血球生成素類類物質的危害。",
    "educationalNotes": "EPO能增加紅血球數量，提高氧氣運輸能力，但會增加血栓和中風風險。"
  },
  {
    "_id": "68a3327c4648e00942711236",
    "athleteName": "Petra Felke",
    "nationality": "東德",
    "sport": "田徑",
    "substance": "Oral-Turinabol (疑似)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1988,
    "eventBackground": "1988年，Petra Felke在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無確鑿證據",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "紀錄至今有效但備受爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Petra Felke Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1988年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711230",
    "athleteName": "Daley Thompson",
    "nationality": "英國",
    "sport": "田徑",
    "substance": "微量Methenolone",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1988,
    "eventBackground": "1988年，Daley Thompson在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無 (濃度過低)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "1999年才公開此事"
    },
    "sourceLinks": [
      {
        "title": "WADA - Daley Thompson Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1988年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711234",
    "athleteName": "Ulf Timmermann",
    "nationality": "東德",
    "sport": "田徑",
    "substance": "Oral-Turinabol (疑似)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1988,
    "eventBackground": "1988年，Ulf Timmermann在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無確鑿證據",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "成績真實性受質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Ulf Timmermann Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1988年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711210",
    "athleteName": "東德女子游泳隊",
    "nationality": "東德",
    "sport": "游泳",
    "substance": "Oral-Turinabol, 睪固酮",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1988,
    "eventBackground": "1988年，東德女子游泳隊在游泳項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "歷史案例",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "1990年德國統一後才曝光，無法追溯處罰"
    },
    "sourceLinks": [
      {
        "title": "WADA - 東德女子游泳隊 Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1988年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a330b62b645feb5c128ca7",
    "athleteName": "Carl Lewis",
    "nationality": "美國",
    "sport": "田徑",
    "substance": "Stimulants (微量)",
    "substanceCategory": "S6: 興奮劑",
    "year": 1988,
    "eventBackground": "1988年，Carl Lewis在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "2003年才公開此事"
    },
    "sourceLinks": [
      {
        "title": "WADA - Carl Lewis Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1988年田徑界的重要禁藥案例，展現了S6: 興奮劑類物質的危害。",
    "educationalNotes": "興奮劑能提高警覺性和能量，但會造成心律不整和成癮問題。"
  },
  {
    "_id": "68a32b0c48880096fcf4ac59",
    "athleteName": "Ben Johnson",
    "nationality": "加拿大",
    "sport": "田徑",
    "substance": "Stanozolol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1988,
    "eventBackground": "1988年漢城奧運會100公尺決賽，以9.79秒打破世界紀錄奪金，但賽後藥檢呈陽性反應。",
    "punishment": {
      "banDuration": "2年",
      "resultsCancelled": true,
      "medalStripped": true,
      "otherPenalties": "世界紀錄被取消"
    },
    "sourceLinks": [
      {
        "title": "WADA - Ben Johnson Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "史上最著名的禁藥醜聞之一，改變了奧運會的藥檢制度。",
    "educationalNotes": "Stanozolol是一種合成代謝類固醇，可增加肌肉質量和力量，但會造成肝損傷等副作用。"
  },
  {
    "_id": "68a3327c4648e00942711232",
    "athleteName": "Jürgen Schult",
    "nationality": "東德",
    "sport": "田徑",
    "substance": "Oral-Turinabol (疑似)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1986,
    "eventBackground": "1986年，Jürgen Schult在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無確鑿證據",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "紀錄合法性受質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jürgen Schult Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1986年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711216",
    "athleteName": "Marita Koch",
    "nationality": "東德",
    "sport": "田徑",
    "substance": "Oral-Turinabol (疑似)",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1985,
    "eventBackground": "1985年，Marita Koch在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無證據確鑿",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "紀錄合法性永久受質疑"
    },
    "sourceLinks": [
      {
        "title": "WADA - Marita Koch Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1985年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711218",
    "athleteName": "Jarmila Kratochvílová",
    "nationality": "捷克斯洛伐克",
    "sport": "田徑",
    "substance": "類固醇 (疑似)",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 1983,
    "eventBackground": "1983年，Jarmila Kratochvílová在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無確鑿證據",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "紀錄的真實性備受爭議"
    },
    "sourceLinks": [
      {
        "title": "WADA - Jarmila Kratochvílová Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1983年田徑界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711224",
    "athleteName": "Joachim Kunz",
    "nationality": "東德",
    "sport": "田徑",
    "substance": "Oral-Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1980,
    "eventBackground": "1980年，Joachim Kunz在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無 (當時未檢出)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "1990年後承認使用禁藥"
    },
    "sourceLinks": [
      {
        "title": "WADA - Joachim Kunz Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1980年田徑界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711214",
    "athleteName": "Rica Reinisch",
    "nationality": "東德",
    "sport": "游泳",
    "substance": "Oral-Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1980,
    "eventBackground": "1980年，Rica Reinisch在游泳項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無 (當時未檢出)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "後來公開譴責東德制度"
    },
    "sourceLinks": [
      {
        "title": "WADA - Rica Reinisch Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1980年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e00942711212",
    "athleteName": "Petra Schneider",
    "nationality": "東德",
    "sport": "游泳",
    "substance": "Oral-Turinabol",
    "substanceCategory": "S1.1: 外源性合成代謝雄激素類固醇",
    "year": 1980,
    "eventBackground": "1980年，Petra Schneider在游泳項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無 (當時未檢出)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "健康受到永久損害"
    },
    "sourceLinks": [
      {
        "title": "WADA - Petra Schneider Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1980年游泳界的重要禁藥案例，展現了S1.1: 外源性合成代謝雄激素類固醇類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a330b62b645feb5c128cad",
    "athleteName": "東德游泳系統",
    "nationality": "東德",
    "sport": "游泳",
    "substance": "State-sponsored doping",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 1976,
    "eventBackground": "1976年，東德游泳系統在游泳項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "歷史案例",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "政治制度崩解後曝光"
    },
    "sourceLinks": [
      {
        "title": "WADA - 東德游泳系統 Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Aquatics",
        "url": "https://www.worldaquatics.com/",
        "type": "官方文件"
      }
    ],
    "summary": "1976年游泳界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "合成代謝類固醇能增加肌肉量和力量，但會對心血管系統造成嚴重副作用。"
  },
  {
    "_id": "68a3327c4648e0094271121a",
    "athleteName": "Tamara Press",
    "nationality": "蘇聯",
    "sport": "田徑",
    "substance": "睪固酮 (疑似)",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 1966,
    "eventBackground": "1966年，Tamara Press在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無 (自行退役)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "避開性別檢測"
    },
    "sourceLinks": [
      {
        "title": "WADA - Tamara Press Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1966年田徑界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  },
  {
    "_id": "68a3327c4648e0094271121c",
    "athleteName": "Irina Press",
    "nationality": "蘇聯",
    "sport": "田徑",
    "substance": "睪固酮 (疑似)",
    "substanceCategory": "S1: 合成代謝劑",
    "year": 1966,
    "eventBackground": "1966年，Irina Press在田徑項目中的禁藥案例對當時的體育界產生重大影響。",
    "punishment": {
      "banDuration": "無 (自行退役)",
      "resultsCancelled": false,
      "medalStripped": false,
      "otherPenalties": "Press姊妹現象"
    },
    "sourceLinks": [
      {
        "title": "WADA - Irina Press Case",
        "url": "https://www.wada-ama.org/",
        "type": "WADA"
      },
      {
        "title": "World Athletics",
        "url": "https://www.worldathletics.org/",
        "type": "官方文件"
      }
    ],
    "summary": "1966年田徑界的重要禁藥案例，展現了S1: 合成代謝劑類物質的危害。",
    "educationalNotes": "睪固酮是最基本的合成代謝類固醇，天然存在於人體但過量使用屬違規。"
  }
],
  statistics: {
    totalCases: 166,
    countries: ["美國", "波蘭", "義大利", "法國", "多明尼加", "俄羅斯", "羅馬尼亞", "奈及利亞", "冰島", "英國", "肯亞", "中國", "墨西哥", "哈薩克", "挪威", "巴西", "南韓", "伊朗", "牙買加", "西班牙", "亞塞拜然", "德國", "希臘", "波多黎各", "澳洲", "土耳其", "瑞士", "愛爾蘭", "丹麥", "東德", "加拿大", "捷克斯洛伐克", "蘇聯"],
    substances: ["Trenbolone", "Trimetazidine", "Clostebol", "大麻", "Testosterone", "Roxadustat", "Ostarine（污染）", "EPO, HGH", "Nandrolone", "公開討論使用", "錯過檢測", "Prednisolone (強體松)", "Cardarine（污染）", "Testosterone（TUE）", "Growth Hormone Releasing Peptide-2", "利尿劑", "Ipamorelin", "Anti-Doping Rule Violations", "EPO", "大麻、酒精", "多種處方藥物", "Furosemide", "Trimetazidine (疑似)", "拒絕檢測", "Clenbuterol", "Anti-inflammatory (抗炎藥)", "公開承認使用", "Ligandrol (LGD-4033)", "Turinabol (4-chlorodehydromethyltestosterone)", "Methylphenidate (甲基苯丙胺)", "Meldonium", "Turinabol", "Testosterone和Clostebol", "Clomiphene", "GHRP-6", "Meldonium (疑似)", "Probenecid", "L-carnitine注射", "公開使用（非藥檢聯盟）", "HGH (指控)", "Nandrolone (爭議)", "系統性使用多種禁藥", "Drostanolone", "Testosterone等多種", "系統性國家禁藥", "系統性國家禁藥計劃", "睪固酮、HGH", "Methandienone", "Oxilofrine", "Hydrochlorothiazide", "EPO, 類固醇", "合成代謝類固醇", "Triamcinolone (曲安奈德)", "Corticosteroid (皮質類固醇)", "Stanozolol", "EPO、睪固酮、皮質類固醇", "自體免疫疾病藥物", "DHEA, Pregnenolone", "HCG (人類絨毛膜促性腺激素)", "Blood Doping (指控)", "睪固酮", "PED cocktail", "THG (Tetrahydrogestrinone)", "Oxandrolone", "THG, EPO", "THG", "THG, The Cream", "THG, 類固醇", "THG (聲稱不知情)", "THG設計者", "Modafinil", "THG, EPO, 類固醇", "Diuretic", "EPO (疑似)", "EPO, 生長激素, 類固醇", "Androstenedione (疑似)", "Testosterone (歷史案例)", "EPO, 血液禁藥", "Amphetamines", "DHT (雙氫睪固酮)", "DHT", "EPO研發應用", "Oral-Turinabol (疑似)", "微量Methenolone", "Oral-Turinabol, 睪固酮", "Stimulants (微量)", "類固醇 (疑似)", "Oral-Turinabol", "State-sponsored doping", "睪固酮 (疑似)"]
  },
  tue: {
    basic: {},
    diseases: [],
    tools: []
  },
  filterOptions: {
    sports: ["田徑", "網球", "籃球", "足球", "棒球", "花式滑冰", "健力", "大力士", "游泳", "MMA/UFC", "美式足球", "拳擊", "高爾夫", "MMA", "自行車", "體操", "舉重/大力士", "舉重", "韻律泳", "越野滑雪", "冬季兩項", "俯式冰橇", "多項目", "摔跤", "競速滑冰", "化學家", "板球", "科學支援"],
    substances: ["Trenbolone", "Trimetazidine", "Clostebol", "大麻", "Testosterone", "Roxadustat", "Ostarine（污染）", "EPO, HGH", "Nandrolone", "公開討論使用", "錯過檢測", "Prednisolone (強體松)", "Cardarine（污染）", "Testosterone（TUE）", "Growth Hormone Releasing Peptide-2", "利尿劑", "Ipamorelin", "Anti-Doping Rule Violations", "EPO", "大麻、酒精", "多種處方藥物", "Furosemide", "Trimetazidine (疑似)", "拒絕檢測", "Clenbuterol", "Anti-inflammatory (抗炎藥)", "公開承認使用", "Ligandrol (LGD-4033)", "Turinabol (4-chlorodehydromethyltestosterone)", "Methylphenidate (甲基苯丙胺)", "Meldonium", "Turinabol", "Testosterone和Clostebol", "Clomiphene", "GHRP-6", "Meldonium (疑似)", "Probenecid", "L-carnitine注射", "公開使用（非藥檢聯盟）", "HGH (指控)", "Nandrolone (爭議)", "系統性使用多種禁藥", "Drostanolone", "Testosterone等多種", "系統性國家禁藥", "系統性國家禁藥計劃", "睪固酮、HGH", "Methandienone", "Oxilofrine", "Hydrochlorothiazide", "EPO, 類固醇", "合成代謝類固醇", "Triamcinolone (曲安奈德)", "Corticosteroid (皮質類固醇)", "Stanozolol", "EPO、睪固酮、皮質類固醇", "自體免疫疾病藥物", "DHEA, Pregnenolone", "HCG (人類絨毛膜促性腺激素)", "Blood Doping (指控)", "睪固酮", "PED cocktail", "THG (Tetrahydrogestrinone)", "Oxandrolone", "THG, EPO", "THG", "THG, The Cream", "THG, 類固醇", "THG (聲稱不知情)", "THG設計者", "Modafinil", "THG, EPO, 類固醇", "Diuretic", "EPO (疑似)", "EPO, 生長激素, 類固醇", "Androstenedione (疑似)", "Testosterone (歷史案例)", "EPO, 血液禁藥", "Amphetamines", "DHT (雙氫睪固酮)", "DHT", "EPO研發應用", "Oral-Turinabol (疑似)", "微量Methenolone", "Oral-Turinabol, 睪固酮", "Stimulants (微量)", "類固醇 (疑似)", "Oral-Turinabol", "State-sponsored doping", "睪固酮 (疑似)"],
    years: [1966, 1976, 1980, 1983, 1985, 1986, 1988, 1990, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2003, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  }
};

// 模擬 API 響應
const mockResponse = (data) => Promise.resolve({ data });

// Cases API
export const casesAPI = {
  getAll: (params) => api ? api.get('/cases', { params }) : mockResponse(mockData.cases),
  getById: (id) => api ? api.get(`/cases/${id}`) : mockResponse(mockData.cases.find(c => c._id === id) || null),
  create: (data) => api ? api.post('/cases', data) : mockResponse(data),
  update: (id, data) => api ? api.put(`/cases/${id}`, data) : mockResponse(data),
  delete: (id) => api ? api.delete(`/cases/${id}`) : mockResponse({ success: true })
};

// Statistics API
export const statisticsAPI = {
  getOverview: () => api ? api.get('/statistics/overview') : mockResponse(mockData.statistics)
};

// TUE API
export const tueAPI = {
  getBasic: () => api ? api.get('/tue/basic') : mockResponse(mockData.tue.basic),
  getDiseases: () => api ? api.get('/tue/diseases') : mockResponse(mockData.tue.diseases),
  getTools: () => api ? api.get('/tue/tools') : mockResponse(mockData.tue.tools)
};

// Education API
export const educationAPI = {
  getArticles: () => api ? api.get('/education/articles') : mockResponse([]),
  getArticleById: (id) => api ? api.get(`/education/articles/${id}`) : mockResponse(null)
};

export { mockData };
export default { casesAPI, statisticsAPI, tueAPI, educationAPI };
