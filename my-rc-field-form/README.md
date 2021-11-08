## 参考antd依赖的rc-form实现

## 实现代码

[用例](./src/pages/RcForm/RcForm.classify.js)
[源码](./src/pages/RcForm/components/my-rc-field-form)

## 核心代码及要点

1. react context的使用，``Form``组件这一层通过``Context.Provider``将store对象传递给``Field``组件

2. ``React.cloneElement``方法的使用，在``Field``组件中使用，复制子组件（一般是``Input``，``Radio``这类控件）及增加``value``, ``onChange``属性，并且和``store``绑定

3. ``Field``元素订阅``store``变化，在``store``字段改变的时候触发视图更新