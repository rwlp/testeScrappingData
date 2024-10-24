/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use playwright navigate to the following urls.
 *      Check response status code (200, 404, 403), proceed only in case of code 200, throw an error in other cases.
 *      Use playwright methods select the country associated with the url.
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
 *          currency: 'GBP',
 *          title: 'Aqualung Computer subacqueo i330R'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 */

const { firefox } = require("playwright");
const cheerio = require("cheerio");

const urls = [
  {
    url: 'https://www.selfridges.com/US/en/product/fear-of-god-essentials-camouflage-panels-relaxed-fit-woven-blend-overshirt_R04364969/#colour=WOODLAND%20CAMO',
    country: 'GB'
  },
  {
    url: 'https://www.selfridges.com/ES/en/product/gucci-interlocking-g-print-crewneck-cotton-jersey-t-shirt_R04247338/',
    country: 'US'
  },
  {
    url: 'https://www.selfridges.com/US/en/product/fear-of-god-essentials-essentials-cotton-jersey-t-shirt_R04318378/#colour=BLACK',
    country: 'IT'
  }
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
    } else {
      this.errorLog = undefined;
      this.fullPrice = dataToConvert.fullPrice
      this.discountedPrice = dataToConvert.discountedPrice;
      this.currency = dataToConvert.currency;
      this.title = dataToConvert.title;
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
  const browser = await firefox.launch();
  const page = await browser.newPage();

  for (const url of urls) {
    try {
      const countryAbbrev = url.country;

      const response = await page.goto(url.url, { waitUntil: 'networkidle' });
      const status = response.status();

      analyseResponse(status);

      await page.click('a[aria-label="Change currency or language"]');

      // handle cookie button if appears
      const button = await page.$('o-button c-cookie-banner__accept-all');
      if (button) {
        // Click the button if it exists
        await button.click();
      } 
      await page.click('div.js-custom-select-selected');
      await page.click(`li[data-countryabbrev="${countryAbbrev}"]`);
      await page.click('a.btn-black.cta.flyout-continue');
      await page.waitForSelector('.sc-eb97dd86-1 > span:nth-child(1)');

      const content = await page.content();

      const $ = cheerio.load(content);

      const price = $('.sc-eb97dd86-1 > span:nth-child(1)').text().slice(1);;
      const currency = $('.country-selector > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > figure:nth-child(1) > figcaption:nth-child(2) > p:nth-child(1) > a:nth-child(1)')
        .text().split(' ').at(2);
      const title = $('p.sc-5ec017c-3:nth-child(2)').text();

      const productData = new ProductModel({
        urlCrawled: url.url,
        fullPrice: Number(price),
        discountedPrice: Number(price),
        currency: currency,
        title: title,
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

  console.log(result);
}

main();


