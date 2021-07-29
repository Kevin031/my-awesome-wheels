const fs = require('fs')
const path = require('path')

const parser = require('@babel/parser') // AST
const traverse = require('@babel/traverse').default // 节点遍历
const babel = require('@babel/core') // ES6 -> ES5

/**
 * 收集依赖
 * @param {*} file 
 * @returns 
 */
function getModuleInfo(file) {
  const body = fs.readFileSync(file, 'utf-8')

  // 转换ast语法树
  const ast = parser.parse(body, { sourceType: 'module' })

  // 依赖收集 import xxx
  const deps = {}
  traverse(ast, {
    // visitor
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

// console.log('bundle', bundle('./example/index.js'))

!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', content)