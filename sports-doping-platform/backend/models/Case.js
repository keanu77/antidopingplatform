const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  athleteName: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  substance: {
    type: String,
    required: true
  },
  substanceCategory: {
    type: String,
    enum: [
      'S1: 合成代謝劑',
      'S1.1: 外源性合成代謝雄激素類固醇',
      'S1.2: 其他合成代謝劑',
      'S2.1: 促紅血球生成素類',
      'S2.2: 生長激素',
      'S2.3: 生長因子',
      'S3: Beta-2激動劑',
      'S4.4: 代謝調節劑',
      'S5: 利尿劑和掩蔽劑',
      'S6: 興奮劑',
      'S7: 麻醉劑',
      'S8: 大麻類',
      'S9: 糖皮質激素',
      'M1: 血液和血液成分操作',
      'M2: 化學和物理操作',
      'M3: 基因和細胞禁藥',
      'P1: Beta阻斷劑',
      'S0: 未批准物質',
      '其他/清白記錄',
      '清白記錄/合法使用',
      'TUE合法使用'
    ],
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  eventBackground: {
    type: String,
    required: true
  },
  punishment: {
    banDuration: {
      type: String,
      required: true
    },
    resultsCancelled: {
      type: Boolean,
      default: false
    },
    medalStripped: {
      type: Boolean,
      default: false
    },
    otherPenalties: String
  },
  sourceLinks: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['新聞', 'WADA', '官方文件', '其他']
    }
  }],
  imageUrl: String,
  summary: String,
  educationalNotes: String,
  relatedCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
CaseSchema.index({ 
  athleteName: 'text', 
  substance: 'text', 
  sport: 'text',
  summary: 'text',
  nationality: 'text'
});

// Add compound indexes for filtering (最常用的組合)
CaseSchema.index({ sport: 1, year: -1 });
CaseSchema.index({ nationality: 1, year: -1 });
CaseSchema.index({ substanceCategory: 1, year: -1 });
CaseSchema.index({ year: -1, createdAt: -1 }); // 預設排序

// Add indexes for punishment filtering
CaseSchema.index({ 'punishment.banDuration': 1 });
CaseSchema.index({ 'punishment.medalStripped': 1 });
CaseSchema.index({ 'punishment.resultsCancelled': 1 });

// 複合索引支援多重篩選
CaseSchema.index({ sport: 1, nationality: 1, year: -1 });
CaseSchema.index({ sport: 1, substanceCategory: 1, year: -1 });
CaseSchema.index({ substanceCategory: 1, 'punishment.banDuration': 1 });

module.exports = mongoose.model('Case', CaseSchema);