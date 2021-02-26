import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import StoreIcon from '@material-ui/icons/Book';
import FullScreenIcon from '@material-ui/icons/Fullscreen';
import CloseFullScreenIcon from '@material-ui/icons/FullscreenExit';
import LockIcon from '@material-ui/icons/Lock';
import UnlockIcon from '@material-ui/icons/LockOpen';
import MenuIcon from '@material-ui/icons/Menu';
import PriceIcon from '@material-ui/icons/MonetizationOn';
import PersonIcon from '@material-ui/icons/Person';
import ProdIcon from '@material-ui/icons/Shop';
import ShopIcon from '@material-ui/icons/ShoppingCart';
import React, { Component } from 'react';
import { ControlLabel, Form, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { Link, Route, withRouter } from 'react-router-dom';
import Loadable from 'react-loadable';
import Switch from 'react-router-dom/Switch';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';
import './App.css';
import DB from './api/DbFunctions';
import Play from './media/play.jpg';
import LoadAnim from './media/loadAnim.svg';
const electron = window.require('electron')
const fs = electron.remote.require('fs')
const app = electron.remote.app
const win = electron.remote.getCurrentWindow()


const Loading = () => <div><p/><img src={LoadAnim} className="loading" alt="loading...."/></div>;

const Transactions = Loadable({
    loader: () => import('./components/transaction/Transactions'),
    loading: Loading,
});

const Customers = Loadable({
    loader: () => import('./components/customer/Customers'),
    loading: Loading,
});

const Products = Loadable({
    loader: () => import('./components/product/Products'),
    loading: Loading,
});

const Prices = Loadable({
    loader: () => import('./components/price/Prices'),
    loading: Loading,
});

const Stocks = Loadable({
    loader: () => import('./components/stock/Stocks'),
    loading: Loading,
});

const CustomerCreate = Loadable({
    loader: () => import('./components/customer/CustomerCreate'),
    loading: Loading,
});

const CustomerDetails = Loadable({
    loader: () => import('./components/customer/CustomerDetails'),
    loading: Loading,
});

const ProductCreate = Loadable({
    loader: () => import('./components/product/ProductCreate'),
    loading: Loading,
});

const ProductDetails = Loadable({
    loader: () => import('./components/product/ProductDetails'),
    loading: Loading,
});

const TransactionCreate = Loadable({
    loader: () => import('./components/transaction/TransactionCreate'),
    loading: Loading,
});



class App extends Component {
    constructor(props) {
        super()
        this.state = {
            auth: false,
            width: 0,
            pad: 0,
            fullIcon: FullScreenIcon,
            open: true,
            check: false,
            lock: LockIcon,
            title: "Sales"
        }
        this.full = false;
    }

    componentWillMount() {
        if (!fs.existsSync(app.getPath("userData").replace(/\\/g, '/') + '/CYJEGYSFIOMP'))
            DB.createDatabase()
    }

    setNav = (e) => {
		e.preventDefault()
		if (this.state.width === 250) {
			this.setState({ width: 0, pad: 0 })
		}
		else this.setState({ width: 250, pad: 250 })
	}

    setFullScreen = () => {
        win.setFullScreen(!(win.isFullScreen()));
        if (this.full === true) {
            this.setState({ fullIcon: FullScreenIcon })
            this.full = false
        }
        else {
            this.setState({ fullIcon: CloseFullScreenIcon })
            this.full = true
        }
    }

	setPass = (e) => {
		e.preventDefault()
		this.password = e.target.value
	}

	confirm = () => {
		if (this.password === 'electron') {
			this.setState({auth: true, open: false, check: true, lock: UnlockIcon})
		}
		else this.setState({auth: false, open: false, check: true, lock: LockIcon})
	}

    authenticate = () => {
        return (
            <Modal
                show={this.state.open}
                onHide={() => this.setState({open: false, check: true, auth: false, lock: LockIcon})}
                container={this}
                aria-labelledby="contained-modal-title"
                backdrop={true}
                autoFocus={true}
            >
                <div className="container-fluid" style={{paddingTop: 0}} >
                    <div className="row">
                        <Form>
                        <div className="col-md-12 left-align">
                            <FormGroup style={{marginTop: 50}}  >
                                <ControlLabel>Administrator</ControlLabel>
                                <FormControl autoFocus={true} type="password" id = "amount"placeholder="Admin Password" onChange={this.setPass.bind(this)}/>    
                            </FormGroup>
                        </div>
                        <div className="col-md-12 left-align">
                            <Button type="submit" variant="outlined" color="secondary" onClick={this.confirm.bind(this)} style={{marginBottom: 50}} >Confirm</Button>
                        </div>
                        </Form>
                    </div>	
                </div>
            </Modal>
        )
    }

    Nav = () => {
      return (
          <div className="side_nav" style={{width: this.state.width}} onClick={this.setNav}> 
              <SideNav highlightColor='#FFF' highlightBgColor='rgb(66, 64, 64)' defaultSelected='sales'>          
                  <img src={Play} alt="play" className="img-responsive image" />
                  <Link to="/"><Nav id='sales' onClick={()=>this.setState({title: "Sales"})} >
                      <NavText>Sales</NavText><NavIcon><ShopIcon/></NavIcon>
                  </Nav></Link>
                  <Link to="/customers"><Nav id='customers' onClick={()=>this.setState({title: "Customers"})}>
                      <NavText>Customers</NavText><NavIcon><PersonIcon/></NavIcon>
                  </Nav></Link>
                  <Link to="/products"><Nav id='products' onClick={()=>this.setState({title: "Inventory"})}>
                      <NavText>Inventory</NavText><NavIcon><ProdIcon/></NavIcon>
                  </Nav></Link>
                  <Link to="/prices"><Nav id='prices' onClick={()=>this.setState({title: "Prices"})}>
                      <NavText>Prices</NavText><NavIcon><PriceIcon/></NavIcon>
                  </Nav></Link>
                  <Link to="/stocks"><Nav id='stocks' onClick={()=>this.setState({title: "Stocks"})}>
                      <NavText>Stocks Log</NavText><NavIcon><StoreIcon/></NavIcon>
				  </Nav></Link>
              </SideNav>
          </div>
        )
    }

    render() {
        if (!this.state.check) {
            return <this.authenticate/>
        }
        return (
            <div style={{flexGrow: 1}} >
                <AppBar position="fixed" className="App-bar" style={{ paddingLeft: this.state.pad }} >
                    <Toolbar>
                        <IconButton style={{marginLeft: -12, marginRight: 20}} color="inherit" aria-label="Menu">
                        <MenuIcon onClick={this.setNav} />
                        </IconButton>
                        <Typography variant="title" color="inherit" style={{flex: 1, fontSize: 20}}>
                            {this.state.title}
                        </Typography>
                        <this.state.lock onClick={() => this.setState({check: false, open: true, auth: false})}/>
                    </Toolbar>
                </AppBar>
                <this.Nav/>
                <div className="App" style={{ paddingLeft: this.state.pad }} onClick={() => this.setState({width: 0, pad: 0})}>
                    <p className="App-intro"></p>
                    <Switch>
                        <Route exact path='/' render={() => <Transactions lock={!this.state.auth}/>}/>
                        <Route exact path='/customers' render={() => <Customers lock={!this.state.auth}/>}/>
                        <Route path='/products' render={() => <Products lock={!this.state.auth}/>}/>
                        <Route path='/prices' render={() => <Prices lock={!this.state.auth}/>}/>
                        <Route path='/stocks' render={() => <Stocks lock={!this.state.auth}/>}/>
                        <Route path='/customerDetails/:value' render={() => <CustomerDetails lock={!this.state.auth}/>}/>
                        <Route path='/productDetails/:value' render={() => <ProductDetails lock={!this.state.auth}/>}/>
                        <Route path='/productCreate/:value' render={() => <ProductCreate lock={!this.state.auth}/>}/>
                        <Route path='/customerCreate/:value' render={() => <CustomerCreate lock={!this.state.auth}/>}/>
                        <Route path='/salesCreate' render={() => <TransactionCreate/>}/>
                        <Route path="*" component={Transactions}/>
                    </Switch>
                </div>
                <footer className="App-footer" style={{ paddingLeft: this.state.pad, transition: '0.5s' }}>
                    <IconButton key="close" aria-label="Close" color="inherit" onClick={this.setFullScreen} style={{paddingBottom: 13, right: 0}}> 
                        <this.state.fullIcon/>
                    </IconButton>
                </footer>
            </div>
        );
    }
}

export default withRouter(App);
