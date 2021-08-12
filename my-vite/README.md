# 代码实现简易的Vite

## 前言

Vite是下一代前端开发与构建工具，是可以代替webpack的工程化方案。

在浏览器支持 ES 模块之前，JavaScript 并没有提供的原生机制让开发者以模块化的方式进行开发。这也正是我们对 “打包” 这个概念熟悉的原因：使用工具抓取、处理并将我们的源码模块串联成可以在浏览器中运行的文件。

时过境迁，我们见证了诸如 [webpack](https://webpack.js.org/)、[Rollup](https://rollupjs.org/) 和 [Parcel](https://parceljs.org/) 等工具的变迁，它们极大地改善了前端开发者的开发体验。

然而，当我们开始构建越来越大型的应用时，需要处理的 JavaScript 代码量也呈指数级增长。包含数千个模块的大型项目相当普遍。我们开始遇到性能瓶颈 —— 使用 JavaScript 开发的工具通常需要很长时间（甚至是几分钟！）才能启动开发服务器，即使使用 HMR，文件修改后的效果也需要几秒钟才能在浏览器中反映出来。如此循环往复，迟钝的反馈会极大地影响开发者的开发效率和幸福感。

Vite 旨在利用生态系统中的新进展解决上述问题：浏览器开始原生支持 ES 模块，且越来越多 JavaScript 工具使用编译型语言编写。

[Vite文档](https://cn.vitejs.dev/)

## Vite特性

Vite有两个最重要的特性：

1. 开发服务器基于**原生ES模块**，实现按需加载
2. 使用**rollup**打包代码

本文着重讲开发服务器的实现原理，具体的实现代码在[这里](./vite.js)

## 前期准备

### 使用vite初始化一个vue项目

```shell
yarn create vite my-vite
cd my-vite
yarn
npm run dev
```

此时vue项目已经运行起来，可以在浏览器控制台network中看到项目请求了各个依赖的js，而不是像webpack那样请求一个压缩的js

### 创建自定义的构建脚本

创建一个`vite.js`的文件，同时安装一下开发所需的依赖，开发服务器采用`koa`

```shell
yarn add koa
```

### 服务搭建

```javascript
const Koa = require('koa')
const fs = require('fs')
const path = require('path')

const app = new Koa()

app.use(async ctx => {
  const { url } = ctx
  console.log(url)
  // todo: 实现各种请求的响应逻辑
})

app.listen(3000, () => {
  console.log('Koa is running at http://localhost:3000')
})

```

运行服务，建议使用`nodemon`做热重载

```shell
nodemon vite.js
```

## 请求html

```javascript
app.use(async ctx => {
  const { url } = ctx
  
  if (url === '/') {
    // 请求html
    const content = fs.readFileSync('./index.html', 'utf-8')
    ctx.type === 'text/html'
    ctx.body = content
  }
})
```

## 请求项目js

```javascript
app.use(async ctx => {
  const { url } = ctx
  
  if (url === '/') {
    // 请求html
  } else if (url.endsWith('.js')) {
    // 请求js
    // 如：/src/main.js => {DIR}/src/main.js
    const dir = path.resolve(__dirname, url.slice(1))
    const content = fs.readFileSync(dir, 'utf-8')
    ctx.type === 'text/javascript'
    ctx.body = content
  }
})
```

此时可以看到浏览器已经加载了`main.js`，由于`vue`模板解析较为复杂，我们改造一下`main.js`先实现简单的版本

```javascript
// main.js
console.log('hello world')

import { createApp, h } from 'vue'

const App = {
  render () {
    return h('div', null, [h('div', null, String(123))])
  }
}

const app = createApp(App).mount('#app')

export default app
```

刷新后可以看到浏览器运行了`main.js`，但是无法请求到`vue`的路径，下一步实现项目依赖的请求

## 请求第三方js

```javascript
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
  const { url } = ctx
  if (url === '/') {
    // 请求html
  } else if (url.endsWith('.js')) {
    // 请求js
    // 如：/src/main.js => {DIR}/src/main.js
    const dir = path.resolve(__dirname, url.slice(1))
    let content = fs.readFileSync(dir, 'utf-8')
    // 先将js中依赖的第三方模块转成/@module/package的请求路径
    content = rewriteImport(content)
    ctx.type === 'text/javascript'
    ctx.body = content
  } else if (url.startsWith('/@module')) {
		// 请求第三方js
    // /@module/vue => node_modules/vue => esmodule入口 === package.json => .module
    const name = url.match(/\/@module\/(.+)/)[1]
    const prefix = path.resolve(__dirname, `node_modules/${name}`)
    // 一般来说esmodule模块的路径都在package.json的module属性下
    const packageJSON = JSON.parse(fs.readFileSync(`${prefix}/package.json`), 'utf-8')
    let content = fs.readFileSync(`${prefix}/${packageJSON.module}`, 'utf-8')
    // 继续转换第三方模块，实现递归请求
    content = rewriteImport(content)
    ctx.type = 'text/javascript'
    ctx.body = content
  }
})
```

此时可以看到vue的模块资源也请求到了，但是运行的时候还是报错，`process`变量未找到，这是因为`process`一般是`vue`开发环境下的一个全局变量，`vite`运行的时候会通过`cross-env`注入进去

## 注入开发环境变量

在`html`文件的解析逻辑中加入以下代码

```javascript
app.use(async ctx => {
  const { url } = ctx
  
  if (url === '/') {
    // 请求html
    const content = fs.readFileSync('./index.html', 'utf-8')
    // 注入环境变量js
    content = content.replace('<script', `<script>window.process = { env: { NODE_ENV: 'dev'} }</script><script `)
    ctx.type === 'text/html'
    ctx.body = content
  }
})
```

这样，就可以看到浏览器中渲染出了`main.js`中的`vue`组件

## TODO

1. 解析`vue`模板文件
2. 解析`less`、`svg`、`img`等非js文件
3. 热更新