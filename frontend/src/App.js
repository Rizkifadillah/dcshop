import './App.css';
import {useEffect} from 'react'
import {BrowserRouter  , Route} from 'react-router-dom'
import Home from './components/Home';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import ProductDetails from './components/product/ProductDetails';
import Login from './components/user/Login'
import Register from './components/user/Register'
import Profile from './components/user/Profile';

import {loadUser} from './actions/userActions'
import store from './store'

function App() {

  useEffect(() =>{
    store.dispatch(loadUser())
  }, [])

  return (
    <BrowserRouter>
      <div className="App">
        <Header/>
          <div className="container container-fluid">
        {/* <Switch > */}
            {/* <Route path="/" element={<Home/>} exact/> */}
            <Route path="/" component={Home} exact />
            <Route path="/search/:keyword" component={Home} />
            {/* <Route path="/product/:id" element={<ProductDetails/>} /> */}
            <Route path="/product/:id" component={ProductDetails} exact />

            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/me" component={Profile} exact/>
        {/* </Switch > */}
          </div>
        <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App;
