const sha1 = require('sha1')
const config = require('../config')
const getRawBody = require('raw-body') // 解析 xml 数据
const parse = new require('xml2js').Parser({
    trim: true,
    explicitArray: false,
    ignoreAttrs:true
}) // xml 转为 js 对象

const ejs = require('ejs')
let tpl = `
<xml>
  <ToUserName><![CDATA[<%-toUserName%>]]></ToUserName>
  <FromUserName><![CDATA[<%-fromUserName%>]]></FromUserName>
  <CreateTime><%=createTime%></CreateTime>
  <MsgType><![CDATA[<%=msgType%>]]></MsgType>
  <Content><![CDATA[<%-content%>]]></Content>
</xml>
`
const compiled = ejs.compile(tpl)
// compiled({
//     toUserName: '接收方的账号',
//     fromUserName: '开发者账号',
//     createTime: new Date().getDate(),
//     msgType: 'text',
//     content: '你好',
// })
function reply(content, fromUserName, toUserName) {
    let info = {}
    info.toUserName = toUserName
    info.fromUserName = fromUserName
    info.createTime = new Date().getDate()
    info.content = content || ''
    info.msgType = 'text'
    return compiled(info)
}
// const replyXML = reply('你好', '开发者账号', '接收方的账号')
// console.log(replyXML)

/**
 *  注意：开发的时候，要时刻关注 toUserName、fromUserName 的大小写
 */
module.exports = () => {
    return async ctx => {
        // ctx.body = 'body hello' // 访问ip网址时显示的内容。
        // console.log(ctx.query) // vscode 终端查看 get 请求参数

        if(!ctx.query) return

        const { signature, echostr, timestamp, nonce } = ctx.query || {}
        const { token } = config

        // 消息是否来自微信服务器
        let isFromWx = sha1([timestamp, nonce, token].join('')) === signature
        
        // get 请求验证 数据是不是来自 微信公众号服务器。
        if(ctx.method === 'GET') {
            if(isFromWx) return ctx.body = echostr
        } else if(ctx.method === 'POST') {
            // post 接收数据
            if(isFromWx) {
                // 解析出 xml
                const xml = await getRawBody(ctx.req,{
                    length: ctx.request.length,
                    limit: "1mb",
                    encoding: ctx.request.charset || 'utf-8'
                })
                // xml 转成 js 对象 【formatResult是对象】
                const formatResult = await parse.parseStringPromise(xml)
                const formated = formatResult.xml || {} // 这一步容易忽略，需要拿出xml

                // 注意
                // 1.这里不是 toUserName 而是 ToUserName。打印下 result 就知道。
                // 2.这里发送方和接收方互换了。
                const replyXML = reply(formated.Content || '你好', formated.ToUserName, formated.FromUserName)
                
                console.log(formatResult.xml)
                console.log(replyXML)
                return ctx.body = replyXML
                // return ctx.body = 'success'
            }
        }
    }
}