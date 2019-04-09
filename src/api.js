import axios from 'axios';

const API_KEY = "K046DHULOTU7D0D9";

function makeAxiosRateInstance() {
    return axios.create({
      baseURL: "https://www.alphavantage.co",
      timeout: 20000
    });
  }
  
  export function getRateCurrency(from_currency, to_currency) {
    return new Promise((resolve, reject) => {
        makeAxiosRateInstance()
        .get(`query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from_currency}&to_currency=${to_currency}&apikey=${API_KEY}`)
        .then(result => {
          // get data from result call api
          let data = result.data['Realtime Currency Exchange Rate'];
          var rate = data['5. Exchange Rate']
          if (data && rate) {
            resolve(parseFloat(rate))
          }
        })
        .catch(result => reject(result.error));
    });
  }