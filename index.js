const express       = require("express");
const mongoose      = require("mongoose");
mongoose.Promise    = global.Promise;

const cron          = require("node-cron");
const env           = process.env.NODE_ENV || "development";
const config        = require("./config")[env];

const Coin          = require("./Coin");

const CoinMarketCap = require("coinmarketcap-api");
const apiKey        = '50d5da7a-1069-4024-861a-ceaf1ce390ec' // '75b6108b-928a-46b5-95fa-ef91e5266e4e';
const client        = new CoinMarketCap(apiKey);

require("./databaseStart")(config);

const app = express();


cron.schedule( '*/5 * * * *' , () => { //  interval   '*/5 * * * *'  '*/10 * * * * *'
// console.log("5m")
    client.getTickers()
        .then((incomingParams) => {
            JSON.stringify(incomingParams)

            let dataArray = incomingParams.data;
            let numberId  = 0;

                dataArray.forEach( element => {

                    let quote = (dataArray[numberId].quote).USD;
                    
                    let name                =  dataArray[numberId].name;
                    let symbol              =  dataArray[numberId].symbol;
                    let market_cap          =  quote.market_cap;
                    let volume_24h          =  quote.volume_24h;
                    let circulating_supply  =  dataArray[numberId].circulating_supply;
                    let percent_change_24h  =  quote.percent_change_24h;

                    let price               =  quote.price;

// Update every coin
                    try {
                        Coin.updateOne({
                                symbol,
                                name
                            }, {
                                $push: {
                                    price,
                                    market_cap,
                                    volume_24h,
                                    circulating_supply,
                                    percent_change_24h
                                }
                            })
                            .then()
                            .catch((err) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                    } catch (err) {
                        console.log(err)
                    }
                    numberId++;
                    });
                })
                .catch(console.error);

// Delete oldest element from the all arrays...
                try {

// No more than 2 elements per array
                    Coin.updateMany( { "market_cap.1": { $exists: 1 }}, 
                        {
                            $pop: {
                                price             : -1,
                                market_cap        : -1,
                                volume_24h        : -1,
                                circulating_supply: -1,
                                percent_change_24h: -1
                            }
                        }, { "multi": true })
                        .then()
                        .catch((err) => {

                            if (err) {
                                console.log(err);
                            }
                        });

                } catch (err) {
                    console.log(err)
                }
});

cron.schedule( '0 0 */6 * * *' , () => { //  interval   '*/5 * * * *'  '*/10 * * * * *'  // at ( 0 seconds, 0 minutes every 6td )hour
       console.log("6h")                                                      
    client.getTickers()

        .then((incomingParams) => {
            JSON.stringify(incomingParams)

            let dataArray = incomingParams.data;
            let numberId  = 0;

                dataArray.forEach( element => {

                    let quote = (dataArray[numberId].quote).USD;
                    
                    let name                =  dataArray[numberId].name;
                    let symbol              =  dataArray[numberId].symbol;
                    let market_cap          =  quote.market_cap;
                    let volume_24h          =  quote.volume_24h;
                    let circulating_supply  =  dataArray[numberId].circulating_supply;
                    let percent_change_24h  =  quote.percent_change_24h;

                    let time                =  new Date();
                    let price               =  quote.price;
                    let price_time          =  { time, price };

// Update every coin
                    try {
                        Coin.updateOne({
                                symbol,
                                name
                            }, {
                                $push: {
                                     price_time,
                                }
                            })
                            .then()
                            .catch((err) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                    } catch (err) {
                        console.log(err)
                    }
                    numberId++;
                    });
                })
                .catch(console.error);

// Delete oldest element from the all arrays...

                try {
                        Coin.updateMany(
                            { "price_time.28": { "$exists": 1 } },
                            { "$push": { "price_time": { "$each": [], "$slice": -28 } } },
                            { "multi": true }
                        )
                        .then()
                        .catch((err) => {

                            if (err) {
                                console.log(err);
                            }
                        });


                } catch (err) {
                    console.log(err)
                }
});

// app.listen(config.port, () => 
// (console.log(`Example app listening on port ...${config.port}...!`)))

app.listen(process.env.PORT || 3033, () => 
(console.log(`Example app listening on port ...${process.env.PORT || 3033}...!`)))