import { autorun } from './mobx'

function observer(target) {
  const _componentWillMount = target.prototype.componentWillMount
  target.prototype.componentWillMount = function() {
      _componentWillMount && _componentWillMount.call(this)
      autorun(() => {
        this.render()
        this.forceUpdate()
      })
  }
  return target
}

export {
  observer
}
