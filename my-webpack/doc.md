# 代码实现简易的Webpack模块打包流程

## 目标一：手撸bundle文件

这一步需要理解`bundle.js`的运行原理

已知有`add.js`

```javascript
exports.default = function (a, b) {
  return a + b
}
```

在`index.js`中引入`add.js`
```javascript
var add = require('add.js').default
console.log(add(1, 2))
```

目标是经打包生成`bundle.js`，在`html`中引入，执行`add`方法输出`3`

### 1. 合并代码

```javascript
var exports = {}
eval(`
  exports.default = function (a, b) {
    return a + b
  }
`)
var add = exports.default
console.log(add(1, 2))
```

### 2. 实现require

```javascript
function require (file) {
  var exports = {};
  (function (exports, code) {
    eval(code)
  })(exports, `exports.default = function (a, b) { return a + b } `);
  return exports;
}
var add = require('add.js').default
console.log(add(1, 2))
```

### 3. 实现模块拆分

```javascript
(function (list) {
  function require (file) {
    var exports = {};
    (function (exports, code) {
      eval(code)
    })(exports, list[file]);
    return exports;
  }
  require('index.js')
})({
  // 收集依赖 -> ES6转ES5 -> 替换require与exports -> 执行入口文件
  'index.js': `
    var add = require('add.js').default
    console.log(add(1, 2))
  `,
  'add.js': `
    exports.default = function (a, b) {
      return a + b
    }
  `
})
```

到这一步，我们就可以知道打包后的`bundle.js`是如何运行的了，下一个目标是通过`node`将原始文件打包生成上面这种格式的`bundle.js`文件



## 目标二：通过Node生成bundle文件



在真实场景中，我们使用的`ES6`的模块规范，即通过``export default ``和`import`语法来导出和导入模块，先将以上两个文件改写成这种方式

```javascript
// add.js
export default (a, b) => a + b
```

```javascript
// index.js
import add from './add.js'
console.log(add(1, 2))
```

下面开始编写node脚本

### 1. 前期准备

```shell
# 初始化npm目录
npm init

# 安装babel相关依赖
yarn add @babel/core @babel/parser @babel/preset-env @babel/traverse

# 创建webpack脚本
touch webpack.js
```

上面出现的4个包的作用分别作用是

`@babel/core`: babe核心代码

`@babel/parser`: 将代码转AST抽象语法树

`@babel/preset-env`: ES6转ES5

`@babel/traverse`: 遍历语法树

引用babel主要做的事情有两个:

1. 收集依赖
2. ES6转ES5

```javascript
const fs = require('fs')
const path = require('path')

const parser = require('@babel/parser') // AST
const traverse = require('@babel/traverse').default // 节点遍历
const babel = require('@babel/core') // ES6 -> ES5
```

### 2. 收集依赖

```javascript
function getModuleInfo(file) {
  const body = fs.readFileSync(file, 'utf-8')

  // 转换ast语法树
  const ast = parser.parse(body, { sourceType: 'module' })

  // 依赖收集 import xxx
  const deps = {}
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file)
      const abspath = './' + path.join(dirname, node.source.value)
      deps[node.source.value] = abspath
    }
  })

  // ES6 -> ES5
  const {
    code
  } = babel.transformFromAst(ast, null, {
    // 预设
    presets: ['@babel/preset-env']
  })

  const info = {
    file,
    deps,
    code
  }
  return info
}
```

### 3. 模块解析

```javascript
/**
 * 模块解析
 * @param {*} file
 */
function parseModules(file) {
  const entry = getModuleInfo(file)
  const temp = [entry]
  const depsGrapth = {}

  getDeps(temp, entry)

  temp.forEach(info => {
    depsGrapth[info.file] = {
      deps: info.deps,
      code: info.code
    }
  })
  
  return depsGrapth
}

/**
 * 递归获取依赖
 * @param {*} temp 
 * @param {*} param1 
 */
function getDeps(temp, { deps }) {
  Object.keys(deps).forEach(key => {
    const child = getModuleInfo(deps[key])
    temp.push(child)
    getDeps(temp, child)
  })
}
```

 ### 4. 生成bundle

```javascript
function bundle (file) {
  const depsGrapth = JSON.stringify(parseModules(file))

  return `(function (graph) {
    function require(file) {
      var exports = {};
      function absRequire(relPath) {
        return require(graph[file].deps[relPath])
      }
      (function (require, exports, code) {
        eval(code)
      })(absRequire, exports, graph[file].code);
      return exports;
    }
    require('${file}')
  })(${depsGrapth})`
}

const content = bundle('./src/index.js')

!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', content)
```

最后运行这个文件，生成`bundle.js`

```shell
node webpack.js
```

这样就实现了一个简易的模块打包机，当然webpack最核心的`loaders`和`plugins`没有包含在内