/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Analyze browser Network Tab to find apis of the following urls.
 *      Tips: extract the productId from the url string.
 *      Use gotScraping to make a request to those apis.
 *
 *      Parse the json and extract:
 *          - fullPrice (it has to be a number)
 *          - discountedPrice (it has to be a number, if it does not exist same as fullPrice)
 *          - currency (written in 3 letters [GBP, USD, EUR...])
 *          - title (product title)
 *
 *      Result example
 *      {
 *          url: ${urlCrawled},
 *          apiUrl: ${apiUrl},
 *          fullPrice: 2000.12,
 *          discountedPrice: 1452.02,
 *          currency: 'GBP',
 *          title: 'Aqualung Computer subacqueo i330R'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 */

const { gotScraping } = require("got-scraping");

const urls = [
    'https://www.stoneisland.com/en-it/collection/polos-and-t-shirts/slim-fit-short-sleeve-polo-shirt-2sc17-stretch-organic-cotton-pique-81152SC17A0029.html',
    'https://www.stoneisland.com/en-it/collection/polos-and-t-shirts/short-sleeve-polo-shirt-22r39-50-2-organic-cotton-pique-811522R39V0097.html'
];

class ProductModel {
  constructor(dataToConvert, urlCrawled, apiUrl) {
    this.urlCrawled = urlCrawled;
    this.apiUrl = apiUrl;
    this.fullPrice = Number(dataToConvert.price.sales.value);
    this.discountedPrice = dataToConvert.promotions ?? this.fullPrice;
    this.currency = dataToConvert.price.sales.currency;
    this.title = dataToConvert.pageMetaTags.title;
  }
}

/**
 * 
 */
async function getData(urls) {
  const urlApiGetProductData = 'https://www.stoneisland.com/on/demandware.store/Sites-StoneEU-Site/en_IT/ProductApi-Product?pid='
  const getById = (idProductString) => urlApiGetProductData + idProductString;
  const resultScrap = [];

  for(const url of urls) {
    const urlToScrapping = getById(url.split('-').at(-1).split('.').at(0))
    
    const fullData = await gotScraping(urlToScrapping).json();

    const convertedProduct = new ProductModel(fullData, urlToScrapping, urlApiGetProductData);

    resultScrap.push(convertedProduct);
  };

  console.log(resultScrap, ' result scrap');

  return resultScrap;
}


async function main() {
  const result = await getData(urls);

  console.log(result);
}

main();

