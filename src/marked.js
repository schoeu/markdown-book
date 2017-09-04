/**
 * @file marked.js
 * @description markdown处理逻辑
 * @author schoeu
 * */

const fs = require('fs-extra');
const url = require('url');
const path = require('path');
const logger = require('./logger.js');
const config = require('./config');
const highlight = require('highlight.js');
const marked = require('marked');
const renderer = new marked.Renderer();

// markdown中渲染代码高亮处理
marked.setOptions({
    highlight: function (code, lang) {
        return highlight.highlightAuto(code).value;
    }
});

// 定制markdown head
renderer.heading = function (text, level) {
    return '<h' + level + ' id="' + encodeURIComponent(text) + '">' + text + '</h' + level + '>';
};

module.exports = {
    /**
     * markdown文件转html处理
     *
     * @param {string} content markdown字符串
     * @return {Object} 渲染信息对象
     * */
    getMarked: function (content) {
        return marked(content, {renderer});
    },

    covMarkdown: async function (ctx, next) {
        let me = this;
        let req = ctx.req;
        let headers = req.headers;
        let ua = headers['user-agent'] || '';
        let time = Date.now();

        let relativePath = url.parse(ctx.url);
        let pathName = relativePath.pathname || '';
        let mdPath = path.join(config.get('path'), pathName);
        mdPath = decodeURIComponent(mdPath);


        let file = await fs.readFile(mdPath, 'utf8');
        if (file) {
            // markdown转换成html
            let content = me.getMarked(file.toString());
            let parseObj = Object.assign(
                {},
                me.locals,
                {
                    navData: 'test',
                    mdData: content
                });
            logger.info({
                access: pathName,
                error: null,
                referer: headers.referer,
                ua: ua,
                during: Date.now() - time + 'ms'
            });
            return parseObj;
        }

        next();
    }
};
