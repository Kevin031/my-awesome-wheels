import { BrowserRouter, Switch, Route } from 'react-router-dom'
import RcFrom from './pages/RcForm/RcForm'

import 'antd/dist/antd.css'
import './App.css'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" component={RcFrom} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
