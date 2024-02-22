const Koa = require('koa')
const app = new Koa()
// 验证微信服务器的有效性
const auth = require('./wechat/auth')

app.use(auth())

// 微信客户端【微信用户】发送消息 =》 微信服务器端接收并转发 =》开发者服务器

app.listen('8000', () => {
    console.log('服务器启动在8000上')
})