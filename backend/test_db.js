const mongoose = require('mongoose');
const Case = require('./models/Case');

mongoose.connect('mongodb://localhost:27017/antidoping')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // 測試總數
    const totalCases = await Case.countDocuments();
    console.log('Total cases:', totalCases);
    
    // 測試運動項目數
    const sports = await Case.distinct('sport');
    console.log('Total sports:', sports.length);
    console.log('Sports:', sports.slice(0, 5));
    
    // 測試國籍數
    const countries = await Case.distinct('nationality');
    console.log('Total countries:', countries.length);
    console.log('Countries:', countries.slice(0, 5));
    
    // 測試最近案例
    const recentCases = await Case.find().sort({ year: -1 }).limit(3).select('athleteName sport year');
    console.log('Recent cases:', recentCases);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });