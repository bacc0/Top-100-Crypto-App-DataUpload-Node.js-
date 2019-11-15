const express       = require("express");
const mongoose      = require("mongoose");
mongoose.Promise    = global.Promise;

const cron          = require("node-cron");
const env           = process.env.NODE_ENV || "development";
const config        = require("./config")[env];

const Coin          = require("./Coin");

const CoinMarketCap = require("coinmarketcap-api");
const apiKey        = "33164b66-ea5f-43cb-89c1-24f56339d005";
const client        = new CoinMarketCap(apiKey);

require("./databaseStart")(config);

const app = express();

let counter = 1;

cron.schedule('*/5 * * * *' , () => {        //  '*/5 * * * *'  '*/10 * * * * *'

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
                            market_cap,
                            volume_24h,
                            circulating_supply,
                            percent_change_24h
                        }
                    })
                    .then()
                    .catch( (err) => {
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

        console.log(counter);

// Delete oldest element from the all arrays. No more than 300 elements per array
        try {
            if ( counter > 298 ) { 
        
                Coin.updateMany( {}, {
                    $pop: {
                        price_time         : -1,
                        market_cap         : -1,
                        volume_24h         : -1,
                        circulating_supply : -1,
                        percent_change_24h : -1
                    }
                })
                .then()
                .catch( (err) => {
    
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                counter++;
            }
        } catch (err) {
            console.log(err)
        }
});

// app.listen(config.port, () => 
// (console.log(`Example app listening on port ...${config.port}...!`)))

app.listen(process.env.PORT || 3033, () => 
(console.log(`Example app listening on port ...${process.env.PORT || 3033}...!`)))


