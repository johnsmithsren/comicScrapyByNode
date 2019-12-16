/*
 * @Auther: renjm
 * @Date: 2019-12-12 15:43:28
 * @LastEditTime: 2019-12-16 17:33:57
 * @Description:
 */
const { options } = require('./lib/options');
const { fetch } = require('./lib/fetch');
const { flatten } = require('./lib/utils');
const phantom = require('phantom')
const Promise = require('bluebird');
const limit = require('p-limit')(10);
const COMIC_DETAIL_PAGE_URI_SELECTOR = '#chapter-list-1 > li > a';
const COMIC_IMAGE_DETAIL_IMAGE_URI_SELECTOR = '#images > img';
const COMIC_IMAGE_DETAIL_PAGES = '#images > p'
const COMIC_TITLE = 'body > div.chapter-view > div.wrap_last_head.autoHeight > div > h1 > a'
const COMIC_CHAPTER = 'body > div.chapter-view > div.wrap_last_head.autoHeight > div > h2'
const _ = require('lodash')
const DEFAULT_INCLUDE = ['title', 'imgUrl', 'desc', 'downloadLink', 'descPageLink'];
const log4js = require("log4js");
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const dirname = 'Comic'
const fs = require('fs')
const request = require('request')
const img2pdf = require('images-to-pdf')
const hostdir = __dirname
log4js.configure({
  appenders: {
    clone: {
      type: "console"
    }
  },
  categories: {
    default: {
      appenders: ["clone"],
      level: "trace"
    }
  }
});
const logger = require("log4js").getLogger("download");


function getComicChapterUrl(cheerio) {
  return cheerio(COMIC_DETAIL_PAGE_URI_SELECTOR).map((idx, ele) => {
    return cheerio(ele).attr('href');
  }).get() || [];
}


let downloadImage = async (imageUrl) => {
  let instance = await phantom.create();
  let page = await instance.createPage();
  await page.open(imageUrl);
  // await page.property('viewportSize', {
  //   width: 1920,
  //   height: 1080
  // })
  let content = await page.property('content')
  page.close();//关闭网页
  $ = cheerio.load(content)
  chapterUrls = []
  let imageSrc = $(COMIC_IMAGE_DETAIL_IMAGE_URI_SELECTOR).map((idx, ele) => {
    return cheerio(ele).attr('src');
  }).get()
  let ComicTitle = $(COMIC_TITLE).map((idx, ele) => {
    return cheerio(ele).text();
  }).get()
  let ComicChapter = $(COMIC_CHAPTER).map((idx, ele) => {
    return cheerio(ele).text();
  }).get()
  let currentPage = $(COMIC_IMAGE_DETAIL_PAGES).map((idx, ele) => {
    return cheerio(ele).text();
  }).get()
  currentPage = _.toNumber(_.get(_.split(_.get(_.split(currentPage, '/'), 0), '('), 1))
  const comicTitlePath = `${hostdir}/${ComicTitle}`
  if (!fs.existsSync(comicTitlePath)) {
    await fs.mkdirSync(comicTitlePath);
  }
  const dstpath = `${hostdir}/${ComicTitle}/${ComicChapter}`
  const imagePath = `${dstpath}/${currentPage}.jpg`
  if (!fs.existsSync(dstpath)) {
    await fs.mkdirSync(dstpath);
    console.log(dstpath)
    await request(imageSrc[0]).pipe(fs.createWriteStream(imagePath))
  } else {
    await request(imageSrc[0]).pipe(fs.createWriteStream(imagePath))
  }
  return []
}

let getChapterImageUrl = async (chapterLink) => {
  if (chapterLink != 'https://www.manhuadui.com/manhua/haizeiwang/438940.html') {
    return []
  }
  let instance = await phantom.create();
  let page = await instance.createPage();
  await page.open(chapterLink);
  // await page.property('viewportSize', {
  //   width: 1920,
  //   height: 1080
  // })
  let content = await page.property('content')
  page.close();//关闭网页
  $ = cheerio.load(content)
  chapterUrls = []
  let totalPage = $(COMIC_IMAGE_DETAIL_PAGES).map((idx, ele) => {
    return cheerio(ele).text();
  }).get()
  totalPage = _.toNumber(_.get(_.split(_.get(_.split(totalPage, '/'), 1), ')'), 0, 0))
  for (let i = 1; i <= totalPage; i++) {
    // https://www.manhuadui.com/manhua/haizeiwang/438940.html?p=2
    chapterUrls.push(`${chapterLink}?p=${i}`);
  }
  let ComicTitle = $(COMIC_TITLE).map((idx, ele) => {
    return cheerio(ele).text();
  }).get()
  let ComicChapter = $(COMIC_CHAPTER).map((idx, ele) => {
    return cheerio(ele).text();
  }).get()
  return { chapterUrls, ComicTitle, ComicChapter }
}

let getComicChapterUrlList = async (config, startUrl) => {
  config = config || { page: 1, include: DEFAULT_INCLUDE };
  let comicUrl = [];
  let pool = [];
  for (let i = 0; i < 1; i++) {
    pool.push(limit(() =>
      fetch({ ...options(startUrl) })
        .then($ => getComicChapterUrl($))
        .catch(err => err.toString())
    ));
  }
  return Promise.all(pool)
    .then(comicChapterList => flatten(comicChapterList)) // get solo movie link
    .then(comicChapterList => {
      pool = [];
      for (let i = 0; i < comicChapterList.length; i++) {
        comicUrl.push(`https://www.manhuadui.com${comicChapterList[i]}`)
      }
      return comicUrl;
    })
    .then(result => result.filter(v => v));
};


(async () => {
  try {
    const startUrls = ['https://www.manhuadui.com/manhua/haizeiwang/']
    for (let startUrl of startUrls) {
      let chapterList = await getComicChapterUrlList({
        page: 1,
        include: ['title', 'imgUrl']
      }, startUrl)
      for (let chapterLink of chapterList) {
        let { chapterUrls, ComicTitle, ComicChapter } = await getChapterImageUrl(chapterLink);
        if (_.isEmpty(chapterUrls)) {
          continue
        }
        for (let imageUrl of chapterUrls) {
          await downloadImage(imageUrl)
        }
        // 这个地方主要是转换image图片到pdf形式的，后续重构，现在发现，如果同时下载然后，走到这一步会报错，unable to write page，暂时没看出问题所在
        // let comicList = await fs.readdirSync(`${__dirname}/${_.get(ComicTitle, '0')}/${_.get(ComicChapter, '0')}`)
        // comicList = comicList.sort((a, b) =>
        //   _.toNumber(_.get(_.split(a, '.'), '0')) > _.toNumber(_.get(_.split(b, '.'), '0')) ? 1 : -1
        // );
        // comicList = _.transform(comicList, (result, comicPath) => result.push(`${__dirname}/${_.get(ComicTitle, '0')}/${_.get(ComicChapter, '0')}/${comicPath}`), [])
        // await img2pdf(comicList, `${__dirname}/${_.get(ComicChapter, '0')}.pdf`)
      }
    }

    logger.info("下载完成");
  } catch (e) {
    logger.error(e);
  }
})();

