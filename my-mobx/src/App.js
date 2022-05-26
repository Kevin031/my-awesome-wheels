// import { observable } from 'mobx'
// import { observer } from 'mobx-react'
import React from 'react'
import { observable } from './my-mobx/mobx'
import { observer } from './my-mobx/mobx-react'

class Store {
  state = observable({
    count: 0
  })

  increase () {
    this.state.count += 1
  }

  reset () {
    this.state.count = 0
  }
}

const store = new Store()

@observer
class View extends React.Component {
  render () {
    const { store } = this.props
    return <div>
      <div>count: {store.state.count}</div>
      <button onClick={() => store.increase()}>add</button>
      <button onClick={() => store.reset()}>reset</button>
    </div>
  }
}

const App = () => {
  return <View store={store} />
}

export default App;
