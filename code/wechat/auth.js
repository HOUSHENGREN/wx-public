const sha1 = require('sha1')
const config = require('../config')

module.exports = () => {
    return async ctx => {
        // ctx.body = 'body hello' // 访问ip网址时显示的内容。
        // console.log(ctx.query) // vscode 终端查看 get 请求参数

        if(!ctx.query) return

        const { signature, echostr, timestamp, nonce } = ctx.query || {}
        const { token } = config
        
        // get 请求验证 数据是不是来自 微信公众号服务器。
        if(ctx.method === 'GET') {
            if(sha1([timestamp, nonce, token].join('')) === signature) return ctx.body = echostr
        } else if(ctx.method === 'POST') {
            // post 接收数据
    
        }
    }
}