/** Helper functions for using puppeteer for e2e testing */

export const getAllHtmlForSelector = async (page, selector) => {
  const elements = await page.$$(selector);
  return Promise.all(
    elements.map(async el => page.evaluate(e => e.innerHTML, el))
  );
};
