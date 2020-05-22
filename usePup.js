/*
 * @Auther: renjm
 * @Date: 2020-05-18 10:20:23
 * @LastEditTime: 2020-05-22 11:09:59
 * @Description:  使用puppeteer
 */
const puppeteer = require("puppeteer-extra");
const PDFParser = require("pdf2json");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const defaultConfig = {
  random: false,
  authPass: null,
  useOnlinePac: false,
  TTL: 0,
  global: false,
  reconnectTimes: 3,
  index: 0,
  proxyType: 0,
  proxyHost: null,
  authUser: null,
  proxyAuthPass: null,
  isDefault: false,
  pacUrl: null,
  proxyPort: 0,
  randomAlgorithm: 0,
  proxyEnable: false,
  enabled: true,
  autoban: false,
  proxyAuthUser: null,
  shareOverLan: false,
  localPort: 1080,
};
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

/**
 * @description: 构建配置数组
 * @param {type}
 * @return:
 */
const map = (data) => {
  let configs = [];
  data.map((o, index) => {
    if (parseInt(o[0], 10) >= 10) {
      configs.push({
        enable: true,
        password: o[4],
        method: o[3],
        remarks: `server${index}`,
        server: o[1],
        obfs: "plain",
        protocol: "origin",
        server_port: parseInt(o[2], 10),
        obfsparam: "",
        tcp_over_udp: false,
        udp_over_tcp: false,
        obfs_udp: false,
        time: o[5],
        rate: o[0],
      });
    }
  });
  save(configs);
};

/**
 * @description: 写入json文件，传入默认配置格式
 * @param {type}
 * @return:
 */
const save = (configs) => {
  if (fs.existsSync("./ss.json")) {
    fs.unlinkSync("./ss.json");
  }
  const data = Object.assign({}, defaultConfig, { configs });
  fs.writeFile("./ss.json", JSON.stringify(data), (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("ss.json文件更新成功！！");
  });
};

/**
 * @description: 使用extra来爬取，不能使用waitfornavigation.那样无法通过invisible recaptcha
 * @param {type}
 * @return:
 */
puppeteer.launch({ headless: true }).then(async (browser) => {
  console.log("Getting free-ss...");
  const page = await browser.newPage();
  await page.goto("https://free-ss.site/");
  await page.waitFor(5000);
  await page.pdf({ path: "ss.pdf", format: "A4" });
  const resultSelector = "#tbss tbody tr";
  await page.waitForSelector(resultSelector);
  let result = await page.evaluate((resultSelector) => {
    const rs = Array.from(document.querySelectorAll("#tbss tbody tr td"));
    return rs.map((count) => {
      return count.textContent.trim();
    });
  }, resultSelector);
  result = chunk(result, 8);
  map(result);
  await browser.close();
  console.log(`All done`);
});
