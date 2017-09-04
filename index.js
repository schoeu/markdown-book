/**
 * @file index.js
 * @description 文档入口文件
 * @author schoeu
 * */
const path = require('path');
const Pug = require('koa-pug');
const config = require('./src/config');
const markdown = require('./src/marked');

config.init(path.join('/Users/memee/Downloads/svn/ps-fe-new/map.json'));

// 获取配置信息
let mdb = require('ibook')({
    port: config.get('port'),
    ignoreDir: config.get('ignoreDir'),
    path: config.get('path'),
    dirname: config.get('dirNames')
});
let theme = config.get('theme');

new Pug({
    viewPath: path.join(__dirname, `./themes/${theme}/views`),
    debug: false,
    pretty: false,
    compileDebug: false,
    app: mdb.app
});

mdb.router.all('/', function (ctx, next) {
    ctx.response.redirect('/readme.md');
});

mdb.router.get(/.+.md$/, async function (ctx, next) {
    let text = await markdown.covMarkdown(ctx, next);
    // ctx.type = 'text/html';
    ctx.render('main');
    ctx.body = text;
});
