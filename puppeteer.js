/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use puppeteer navigate to the following urls.
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
 *
 * 2) -----------------------------------------------------------------------------------------------------------
 *      Extract product options (from the select form) and log them
 *      Select/click on the second option (if the second one doesn't exist, select/click the first)
 *
 *      Log options example:
 *      [
 *          {
 *              value: 'Blu - L/XL',
 *              optionValue: '266,1033', // Attribute "value" of option element
 *          }
 *      ]
 * --------------------------------------------------------------------------------------------------------------
 */

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const urls = [
  'https://www.outdoorsrlshop.it/catalogo/1883-trekker-rip.html',
  'https://www.outdoorsrlshop.it/catalogo/2928-arco-man-t-shirt.html'
];

class ProductModel {
  constructor(dataToConvert, urlCrawled, error = undefined) {
    this.urlCrawled = urlCrawled;
    if (error) {
      this.errorLog = error;
      this.fullPrice = null;
      this.discountedPrice = null;
      this.currency = null;
      this.title = null;
      this.options = null;
    } else {
      this.errorLog = undefined;
      this.fullPrice = dataToConvert.fullPrice
      this.discountedPrice = dataToConvert.discountedPrice;
      this.currency = dataToConvert.currency;
      this.title = dataToConvert.title;
      this.options = dataToConvert.options
    }
  }
}

function analyseResponse(status) {
  if (status !== 200) {
    if (status === 404) {
      throw new Error('Page not found')
    } else if (status === 403) {
      throw new Error('Forbidden, credentials needed.')
    }
    else {
      throw new Error(`Unexpected status: ${status}`)
    }
  }
}


async function getProductsData(urls) {
  const result = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const url of urls) {
    try {
      const response = await page.goto(url);
      const status = response.status();

      analyseResponse(status);

      // Get Data Logic
      await page.waitForSelector('.fs-3');

      const content = await page.content();

      const $ = cheerio.load(content);

      const price = $('.fs-3').text().slice(1);;
      const title = $('.pe-4 > h1:nth-child(1)').text();




      const allOptions = [];
      $('.form-select option')
        .each((_i, element) => {
          allOptions.push({
            optionValue: $(element).val(),
            value: $(element).text().trim(),
          });
        });

      let options = undefined;

      if (allOptions.length > 3) {
        options = allOptions[3];
      } else {
        options = allOptions[2];
      }

      const productData = new ProductModel({
        urlCrawled: url.url,
        fullPrice: Number(price),
        discountedPrice: Number(price),
        currency: 'EUR',
        title: title,
        options: options,
      }, url.url);


      result.push(productData);

    } catch (error) {
      result.push(new ProductModel({}, url.url, Error.message) || 'No error details')
      continue;
    }
  }

  browser.close();

  return result;
}


async function main() {
  const result = await getProductsData(urls);

  const logOptions = result.map(element => element.options);

  console.log(logOptions);
}

main();


/*
Extract product options (from the select form) and log them
 *      Select/click on the second option (if the second one doesn't exist, select/click the first)
 *
 *      Log options example:
 *      [
 *          {
 *              value: 'Blu - L/XL',
 *              optionValue: '266,1033', // Attribute "value" of option element
 *          }
 * .form-select
 *      ]
 * */