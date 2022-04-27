require('./promise')

// 测试用例
console.log(1)
const task = () => new Promise((resolve, reject) => {
  console.log(4)
  setTimeout(() => {
    console.log(5)
    resolve(6)
  }, 1000)
})
console.log(2)
const task2 = () => new Promise((resolve, reject) => {
  console.log(8)
  setTimeout(() => {
    resolve(10)
  }, 1000)
})
task().then(data => {
  console.log(data)
  console.log(7)
  return task2()
}, err => {
  console.log('捕获到错误', err)
}).then(data => {
  console.log(9)
  console.log(data)
}, err => {
  console.log('捕获到错误2', err)
}).finally(data => {
  console.log('final')
})
console.log(3)

Promise.all([
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(11)
    }, 3000)
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(12)
    }, 4000)
  })
]).then(data => {
  console.log('promise.all', data)
})

Promise.race([
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(11)
    }, 3000)
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(12)
    }, 4000)
  })
]).then(data => {
  console.log('promise.race', data)
})