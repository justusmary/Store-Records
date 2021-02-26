import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper'
import DB from '../../api/DbFunctions'
import { Table, PageHeader, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';


export default class Prices extends Component {

    constructor(props) {
        super()
        this.state = {
            edit: false,
            validatePrice: [],
            error: false,
            success: false,
            open: false
        }
        this.validNumber = /^[0-9]+$/
        this.customer = ""; this.defaultPrices = []; this.currentPrices = []; this.price = []
        this.statusTitle = ["Your Transaction was Successful", "Your Transaction was Unsuccessful"]
        this.statusMessage = ["Wrong input", "Thank You!!"]; this.message = 1; this.status = 1
    }

    componentWillMount() {
        this.update()
    }

    update = () => {
        var prices = DB.selectAll("prices")
        var products = DB.selectColTitle("prices")
        var customers = DB.selectColumn("customers", "name")
        this.columns = products.slice(1, products.length)
        this.prices = prices.sort((a, b) => { return customers[a[0] - 1][0].localeCompare(customers[b[0] - 1][0])})
    }

    setPrice = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            this.price[e.target.id] = this.defaultPrices[e.target.id]
            var temp = this.state.validatePrice
            temp[e.target.id] = ""
            this.setState({ validatePrice: temp })
            return
        }
        if (e.target.value === 0) {
            this.price[e.target.id] = 0
            temp = this.state.validatePrice
            temp[e.target.id] = ""
            this.setState({ validatePrice: temp })
            return
        }
        if (!e.target.value.match(this.validNumber)) {
            temp = this.state.validatePrice
            temp[e.target.id] = "error"
            this.setState({ validatePrice: temp })
            this.price[e.target.id] = e.target.value
            return
        }
        if (parseInt(e.target.value, 10) < 0) {
            temp = this.state.validatePrice
            temp[e.target.id] = "error"
            this.setState({ validatePrice: temp })
            this.price[e.target.id] = e.target.value
            return
        }
        temp = this.state.validatePrice
        temp[e.target.id] = "success"
        this.setState({ validatePrice: temp })
        this.price[e.target.id] = e.target.value
    }

    confirm = () => {
        for (var i = 0; i < this.columns.length; i++) {
            if (!this.price[i].match(this.validNumber) || parseInt(this.price[i], 10) < 0) {
                this.setState({ open: true })
                this.status = 1; this.message = 0
                return
            }
        }
        DB.updateRow("prices", this.columns, this.price, "customers", this.customer)
        this.setState({ open: true })
        this.status = 0; this.message = 1
    }

    edit = (e) => {
        e.preventDefault()
        if (this.props.lock) return
        this.setState({ edit: true })
        this.customer = e.target.id
        this.setState({
            validatePrice: new Array(this.columns.length)
        })
    }

    snackbar = () => {
        return(
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}
                open={this.state.open} autoHideDuration={6000} onClose={() => this.setState({open: false})}
                message={<span id="message-id" style={{fontSize: '14px'}}>{this.statusTitle[this.status]}</span>}
                action={[
                    <Button color="secondary" size="small" style={{fontSize: '14px'}}>
                        {this.statusMessage[this.message]}
                    </Button>,
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => this.setState({open: false})}
                    >
                        <CloseIcon />
                    </IconButton>
                ]}
            />
        )
    }

    editPrice = () => {
        var i = 0
        var row = DB.selectRow("prices", "customers", this.customer)[0]
        this.defaultPrices = row.slice(1, row.length)
        var currentPrices = []
        for (var m = 0; m < this.defaultPrices.length; m++) {
            this.price.push(this.defaultPrices[m].toString())
            if (this.defaultPrices[m] === 0) {
                currentPrices.push(DB.selectField("products", "price", "product_id", this.columns[m].slice(1,))[0])
            }
            else currentPrices.push(this.defaultPrices[m])
        }

        const priceEdit = currentPrices.map((price) => {
            return (
                <div className="col-md-6 left-align">
                    <FormGroup validationState={this.state.validatePrice[i]}>
                        <ControlLabel>{DB.selectField("products", "name", "product_id", this.columns[i].slice(1,))}</ControlLabel>
                        <FormControl id={i++} type="text" placeholder={price} onChange={this.setPrice} disabled={this.props.lock}/>
                    </FormGroup>
                </div>
            )
        })
        return (
            <div className="container-fluid">
                <this.snackbar/>
                <PageHeader>Update Customer <small>Edit</small></PageHeader>
                {this.state.success && <this.successAlert/>}
                <div className="row">
                    {priceEdit}
                </div>
                <Button variant="fab" color="" className="fabi" onClick={() => {this.setState({edit: false}); this.update()}}>
                    <ArrowBackIcon />
                </Button>
                <Button variant="fab" color="secondary" className="fab" onClick={this.confirm}>
                    <SaveIcon />
                </Button>
            </div>
        )
    }

    render() {
        const customer = this.prices.map((customer) => {
            var values = customer.slice(1,)
            var i = 0
            const prices = values.map((price) => {
                if (price === 0) {
                    price = DB.selectField("products", "price", "product_id", this.columns[i].slice(1,))
                }
                i++
                return (
                    <td>{price}</td>
                )
            })
            return(
              <tr className="left-align tables">
                  <td id={customer[0]} onClick={this.edit}>
                    <a id={customer[0]} onClick={this.edit}>
                      {DB.selectField("customers", "name", "customer_id", customer[0])}
                    </a>
                  </td>
                  {prices}
              </tr>
            )
        })

        const products = this.columns.map((product) => {
            if (this.columns[this.columns.length - 1] === product) {
                return (
                    <th className="head-right-table">{DB.selectField("products", "name", "product_id", product.slice(1,))}</th>
                )
            }
            return (
                <th className="head-table">{DB.selectField("products", "name", "product_id", product.slice(1,))}</th>
            )
        })

        if (this.state.edit) {
            return <this.editPrice/>
        }
        return (
            <div className="container-fluid">
                <PageHeader>Prices <small>All Products and Customers</small></PageHeader>
                <Paper style={{marginTop: 30, marginBottom: 100}}>
                <Table responsive striped condensed hover>
                    <thead>
                        <tr>
                            <th className="head-left-table">Name</th>
                            {products}
                        </tr>
                    </thead>
                    <tbody>
                        {customer}
                    </tbody>
                </Table>
                </Paper>
            </div>
        )
    }
}