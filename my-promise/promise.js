// 1.1 状态:待定pending(初始)
// 1.2 状态:已成功fulfilled
// 1.3 状态:已拒绝rejected

// 2.1 执行resolve后，状态永久变为fulfilled
// 2.2 执行reject后，状态永久变为rejected
// 2.3 如果代码中有throw，直接执行reject
// 2.4 pending状态不会执行then回调

// 3.1 实现then链式调用
// 3.2 实现catch方法

// 4.1 实现Promise.resolve
// 4.2 实现Promise.reject
// 4.3 实现Promise.all
// 4.4 实现Promise.race

// let promise = new Promise((resolve, reject) => {})
// promise().then(() => {})

class MyPromise {
  static PENDING = 'pending'
  static FUL_FILLED = 'fulfilled'
  static REJECTED = 'rejected'

  constructor (func) {
    if (typeof func !== 'function') {
      throw new Error('promise argument must be a function')
    }
    this.onFulFilledCallbacks = []
    this.onRejectedCallbacks = []
    this.state = MyPromise.PENDING
    this.result = null

    try {
      func(this.resolve.bind(this), this.reject.bind(this))
    } catch (err) {
      this.reject(err)
    }
  }

  resolve (result) {
    if (this.state === MyPromise.PENDING) {
      createMicroTask(() => {
        this.state = MyPromise.FUL_FILLED
        this.result = result
        this.onFulFilledCallbacks.forEach(callback => callback(result))
      })
    }
  }

  reject (reason) {
    if (this.state === MyPromise.PENDING) {
      createMicroTask(() => {
        this.state = MyPromise.REJECTED
        this.result = reason
        this.onRejectedCallbacks.forEach(callback => callback(reason))
      })
    }
  }

  then (onFulFilled, onRejected) {
    onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {
      throw reason
    }
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === MyPromise.PENDING) {
        this.onFulFilledCallbacks.push(() => {
          try {
            const x = onFulFilled(this.result)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
        this.onRejectedCallbacks.push(() => {
          try {
            const x = onRejected(this.result)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      } else if (this.state === MyPromise.FUL_FILLED) {
        createMicroTask(() => {
          try {
            const x = onFulFilled(this.result)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      } else if (this.state === MyPromise.REJECTED) {
        createMicroTask(() => {
          try {
            const x = onRejected(this.result)
            resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }
    })
    return promise2
  }

  catch (onRejected) {
    return this.then(undefined, onRejected)
  }

  finally (callback) {
    return this.then(callback, callback)
  }
}

/**
 * 静态方法Promise.resolve
 * @param {*} result 
 * @returns 
 */
MyPromise.resolve = result => {
  if (result instanceof MyPromise) {
    return result
  } else if (result instanceof Object && 'then' in result) {
    return new MyPromise((resolve, reject) => {
      result.then(resolve, reject)
    })
  } else {
    return new MyPromise(resolve => resolve(result))
  }
}

/**
 * 静态方法Promise.reject
 * @param {*} reason 
 * @returns 
 */
MyPromise.reject = reason => {
  return new Promise((resolve, reject) => reject(reason))
}

/**
 * 静态方法Promise.all
 * @param {promise[]} promises
 */
MyPromise.all = promises => {
  return new MyPromise((resolve, reject) => {
    if (Array.isArray(promises)) {
      let result = []
      let count = 0
      promises.forEach((task, index) => {
        if (task instanceof MyPromise) {
          task.then(value => {
            count++
            result[index] = value
            if (count === promises.length) {
              resolve(result)
            }
          }).catch(err => reject(err))
        } else {
          count++
          result[index] = task
          if (count === promises.length) {
            resolve(result)
          }
        }
      })
    } else {
      reject(new Error('Argument is not iterable'))
    }
  })
}

/**
 * 静态方法Promise.race
 * @param {promise[]} promises
 */
MyPromise.race = promises => {
  return new MyPromise((resolve, reject) => {
    if (Array.isArray(promises)) {
      promises.forEach((task, index) => {
        if (task instanceof MyPromise) {
          task.then(value => {
            resolve(value)
          }).catch(err => reject(err))
        } else {
          resolve(task)
        }
      })
    } else {
      reject(new Error('Argument is not iterable'))
    }
  })
}

MyPromise.deferred = () => {
  let result = {}
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
  })
  return result
}

/**
 * 创建一个微任务
 */
const createMicroTask = (func) => {
  if (typeof document !== 'undefined') {
    // 浏览器环境的实现
    const observer = new MutationObserver(() => {
      func()
    })
    let count = 0
    const textNode = document.createTextNode(String())
    observer.observe(textNode, {
      characterData: true
    })
    textNode.data = String(++count)
  } else if (typeof process !== 'undefined') {
    // node环境下用process.nextTick实现
    return process.nextTick(() => func())
  }
}

/**
 * 对resolve和reject的不同传参做处理
 * @param {promise} promise2 promise1.then方法返回的新promise对象
 * @param {any} x promise1中onFulFilled或onRejected的返回值，有可能也是一个promise
 * @param {function} resolve promise2的resolve方法
 * @param {function} reject promise2的reject方法
 */
const resolvePromise = (promise2, x, resolve, reject) => {
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }

  if (x instanceof MyPromise) {
    if (x.state === MyPromise.PENDING) {
      x.then(y => {
        resolvePromise(promise2, y, resolve, reject)
      }, reject)
    } else if (x.state === MyPromise.FUL_FILLED) {
      resolve(x.result)
    } else if (x.state === MyPromise.REJECTED) {
      reject(x.result)
    }
  } else if (x !== null && ((typeof x === 'object' || typeof x === 'function'))) {
    try {
      var then = x.then
    } catch (err) {
      return reject(err)
    }

    if (typeof then === 'function') {
      let called = false
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (err) {
        if (called) return
        called = true
        reject(err)
      }
    } else {
      resolve(x)
    }
  } else {
    return resolve(x)
  }
}

Promise = MyPromise

module.exports = MyPromise