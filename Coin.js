const mongoose = require('mongoose');


const coinSchema = new mongoose.Schema({
      
      id: {
            type: mongoose.Schema.Types.Number,
            required: true
      },
      symbol: {
            type: mongoose.Schema.Types.String,
            required: true
      },
      name: {
            type: mongoose.Schema.Types.String,
            unique: true
      },
      market_cap: [{
            type: mongoose.Schema.Types.Decimal128,
      }],
      volume_24h: [{
            type: mongoose.Schema.Types.Decimal128,
      }],
      circulating_supply: [{
            type: mongoose.Schema.Types.Decimal128,
      }],
      percent_change_24h: [{
            type: mongoose.Schema.Types.Decimal128,
      }],
      price_time: [{
            type: mongoose.Schema.Types.Mixed,
      }]
});

const Coin = mongoose.model('Coin', coinSchema);

module.exports = Coin;