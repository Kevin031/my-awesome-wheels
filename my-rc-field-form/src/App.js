import { BrowserRouter, Switch, Route } from 'react-router-dom'
// import RcForm from './pages/RcForm/RcForm'
import RcForm from './pages/RcForm/RcForm.classify'

import 'antd/dist/antd.css'
import './App.css'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" component={RcForm} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
