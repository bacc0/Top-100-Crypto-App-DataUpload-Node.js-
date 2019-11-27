const mongoose      = require('mongoose');
mongoose.Promise    = global.Promise;

// const mongoDB       = 'mongodb://localhost:27017/crypto-DB'
const mongoDB       = 'mongodb+srv://bacco:666666yu@bacco-d4de0.mongodb.net/test?retryWrites=true&w=majority'


const Coin          = require('./Coin');
const CoinMarketCap = require('coinmarketcap-api');
const apiKey        = '50d5da7a-1069-4024-861a-ceaf1ce390ec' // '75b6108b-928a-46b5-95fa-ef91e5266e4e';
const client        = new CoinMarketCap(apiKey);


module.exports = config => {
      mongoose.connect(mongoDB, {
            useNewUrlParser: true
      });
      const db = mongoose.connection;

      db.once('open', err => {
            if (err) throw err;

            client.getTickers()
                  .then((param) => {
                        JSON.stringify(param)
                        let numberId = 0;
                        let dataArray = param.data;

                        for (let i = 1; i <= dataArray.length; i++) {

                              let position = numberId + 1;
                              let id = dataArray[numberId].id;
                              let symbol = dataArray[numberId].symbol;
                              let name = dataArray[numberId].name;

                              Coin.create({
                                    position,
                                    id,
                                    symbol,
                                    name,
                              });
                              numberId++;
                        };
                        console.log('...Database ready...')
                  })
                  .catch(console.error);
      });

      db.on('error', reason => {
            console.log(reason);
      });
};