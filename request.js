/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use got-scraping to crawl in sequence the following urls.
 *      Check response status code (200, 404, 403), proceed only in case of code 200, throw an error in other cases.
 * 
 *      Using cheerio extract from html:
 *          - fullPrice (it has to be a number)
 *          - discountedPrice (it has to be a number, if it does not exist same as fullPrice)
 *          - currency (written in 3 letters [GBP, USD, EUR...])
 *          - title (product title)
 *
 *      Result example
 *      {
 *          url: ${urlCrawled},
 *          fullPrice: 2000.12,
 *          discountedPrice: 1452.02,
 *          currency: 'EUR',
 *          title: 'Abito Bianco con Stampa Grafica e Scollo a V Profondo'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 * 2) -----------------------------------------------------------------------------------------------------------
 *      Like the first exercise but the urls must be crawled in parallel
 * --------------------------------------------------------------------------------------------------------------
 */




const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const urls = [
  'https://www.miinto.it/p-de-ver-s-abito-slip-3059591a-7c04-405c-8015-0936fc8ff9dd',
  'https://www.miinto.it/p-abito-a-spalline-d-jeny-fdac3d17-f571-4b55-8780-97dddf80ef35',
  'https://www.miinto.it/p-abito-bianco-con-stampa-grafica-e-scollo-a-v-profondo-2b03a3d9-fab1-492f-8efa-9151d3322ae7'
];

class ProductModel {
  constructor(dataToConvert, urlCrawled) {
    this.urlCrawled = urlCrawled;
    this.fullPrice = Number(dataToConvert.fullPrice);
    this.discountedPrice = dataToConvert.discountedPrice;
    this.currency = dataToConvert.currency;
    this.title = dataToConvert.title;
  }
}

/**
 * 
 */
async function getData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(url, {waitUntil: "load"});
  const content = await page.content();

  const $ = cheerio.load(content);

  // getting Data
  const priceAndCurrency = $('*[data-testid="product-price"]').text();

  const fullData = {
    urlCrawled: url,
    price: priceAndCurrency.at(0),
    discountedPrice: $('*[data-testid="product-previous-price"]').text(),
    currency: priceAndCurrency.split(' ').at(1),
    title: $('*[data-testid="product-name"]').text(),
  }

  const convertedProduct = new ProductModel(fullData, url);

  browser.close();

  return convertedProduct;
}


async function main() {
  const requests = urls.map(url => getData(url));
  const responses = await Promise.all(requests);

  console.log(responses);
}

main();

