const puppeteer = require("puppeteer");
const fs = require("fs");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

async function init(title) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://rapidtags.io/generator");

  // Type into search box.
  await page.type("#searchInput", title);

  await page.click("button[type=submit]");
  await page.waitForSelector("span.tag");
  await page.waitForNetworkIdle({
    idleTime: 6000,
  });
  const options = await page.$$eval("div.tagbox > span.tag", (options) => {
    return options.map((option) => option.textContent);
  });

  console.log(options);
  fs.writeFile("tags.json", JSON.stringify(options), "utf8", (err) => {
    if (err) throw err;
    console.log("generated tags json");
  });

  await browser.close();

  return true;
}
module.exports = init;
