const Koa = require('koa')
const fs = require('fs')
const path = require('path')

const app = new Koa()

/**
 * 将引用了node_modules的模块替换成/@module/path的路径
 */
const rewriteImport = content => {
  return content.replace(/ from ['|"]([^'"]+)['|"]/g, function (...args) {
    if (args[1][0] !== '.' && args[1][0] !== '/') {
      return ` from '/@module/${args[1]}'`
    } else {
      return args[0]
    }
  })
}

app.use(async ctx => {
  const { url, query } = ctx
  console.log(url, query)
  if (url === '/') {
    /**
     * 请求html
     */
    let content = fs.readFileSync('./index.html', 'utf-8')
    content = content.replace('<script', `<script>window.process = { env: { NODE_ENV: 'dev'} }</script><script `)
    ctx.type = 'text/html'
    ctx.body = content
  } else if (url.endsWith('.js')) {
    /**
     * 请求项目js
     */
    const dir = path.resolve(__dirname, url.slice(1))
    let content = fs.readFileSync(dir, 'utf-8')
    // 第三方js替换成/@module/前缀
    // vue => /@module/vue
    content = rewriteImport(content)
    ctx.type = 'text/javascript'
    ctx.body = content
  } else if (url.startsWith('/@module')) {
    /**
     * 请求第三方js
     */
    // /@module/vue => node_modules/vue => esmodule入口 === package.json => .module
    const name = url.match(/\/@module\/(.+)/)[1]
    const prefix = path.resolve(__dirname, `node_modules/${name}`)
    const packageJSON = JSON.parse(fs.readFileSync(`${prefix}/package.json`), 'utf-8')
    let content = fs.readFileSync(`${prefix}/${packageJSON.module}`, 'utf-8')
    content = rewriteImport(content)
    ctx.type = 'text/javascript'
    ctx.body = content
  }
})

app.listen(3000, () => {
  console.log('Vite start at 3000')
})
