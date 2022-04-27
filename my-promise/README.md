# 按A+规范实现最简promise

教程 https://juejin.cn/post/7043758954496655397

共分为4步实现，具体参照代码

1.1 状态:待定pending(初始)
1.2 状态:已成功fulfilled
1.3 状态:已拒绝rejected

2.1 执行resolve后，状态永久变为fulfilled
2.2 执行reject后，状态永久变为rejected
2.3 如果代码中有throw，直接执行reject
2.4 pending状态不会执行then回调

3.1 实现then链式调用（*难点）
3.2 实现catch方法

4.1 实现Promise.resolve
4.2 实现Promise.reject
4.3 实现Promise.all
4.4 实现Promise.race

本地测试
```shell
node ./index.js
```

运行A+规范测试

```shell
npm install
npm run test
```
