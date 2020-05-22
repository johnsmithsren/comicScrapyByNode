<!--
 * @Auther: renjm
 * @Date: 2019-12-12 15:43:28
 * @LastEditTime: 2020-05-22 11:06:14
 * @Description:
-->

usePup.js

# 应同学要求爬取 free-ss 网站的账号

# 发现该网站使用了谷歌的 recaptcha，然后单纯从网页破解出 token 感觉有点难

# 然后使用 puppeteer。发现依然无法避开 recaptcha。之后调试发现，如果不开页面，直接请求网页是可以避开 invisible recaptcha 的。

# invisible recaptcha ，如果非要输入验证码，也许还真的得去使用 2captcha 的服务了，本也已经打算尝试，幸而柳暗花明

index.js

# 这个是从另外一个哥们的 github 那边继承来的代码，主要是 lib 文件夹下面的，这个 index 倒是完全被我改了一遍。起因是之前自己写了一个博客，然后也喜欢看漫画，所以就准备了定时脚本来做这个事情，爬取漫画

** 特别注意 **

# 这个两个脚本都是亲测可用，不过分别有使用注意。 usepub 脚本中 puppeteer 需要 node 大于 10 以上.然后当初写 index 的时候，node 版本 10.16.0。导致这两个其实不能共存

# 如果要使用 index.js，做法是 删除 package.json 中的 puppteer 的几个依赖

```
    "puppeteer": "^3.1.0",
    "puppeteer-core": "^3.1.0",
    "puppeteer-extra": "^3.1.9",
    "puppeteer-extra-plugin-adblocker": "^2.11.3",
    "puppeteer-extra-plugin-stealth": "^2.4.9"
```

# 然后

```
   n 10.16.0
   yarn
```

# 如果你同样想要使用这个 样例中的漫画网址，你得终端翻墙，这样 export https_proxy="http://127.0.0.1:1087" ，具体谷歌 终端翻墙。当然可以替换成你想要的网址，然后修改里面的 提取 xpath 即可

# 如果只是使用 usepup.js 脚本的话,node 版本我用的 13.14.0，可以删除 package.json 中的其他无关依赖，yarn 即可。但是 一般会有一个报错

```
(node:6694) UnhandledPromiseRejectionWarning: Error: Could not find browser revision 756035. Run "npm install" or "yarn install" to download a browser binary.
    at ChromeLauncher.launch (/xxxxxxxxxxxx/scrapy-node/node_modules/puppeteer-core/lib/Launcher.js:59:23)
    at async PuppeteerExtra.launch (/xxxxxxx/scrapy-node/node_modules/puppeteer-extra/dist/index.cjs.js:129:25)
(Use `node --trace-warnings ...` to show where the warning was created)
(node:6694) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
```

# 这个报错，解决方法就是直接进入到报错提示给你的 node_modules 中去 cd /xxxxxxxxxxxx/scrapy-node/node_modules/puppeteer-core，然后直接 使用这个包自己提供的安装脚本 node install.js 他会自行安装对应的 chromenium 版本。

# 这之后就没问题了。正常 node usepup.js 就行，我就是这样走过这些坑的。不过我用的是 mac，其他系统我不确定还有啥坑，反正有问题就谷歌，解决问题即可。
