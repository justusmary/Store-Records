import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import DB from '../../api/DbFunctions'
import { 
    FormControl, FormGroup, ControlLabel, HelpBlock,
    InputGroup, Well, PageHeader 
} from 'react-bootstrap';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Checkbox from '@material-ui/core/Checkbox';


class TransactionCreate extends Component {

    constructor(props) {
        super()
        this.state = {
            price: 0,
            balance: 0,
            checked: false,
            disable: false,
            validate: "",
            valid: "",
            stock: 0,
            lock: true,
            open: false,
            date: new Date().toISOString().substring(0, 10).replace(/\//g, '-'),
        }
        this.paid = "0"; this.size = 1; this.customers = []; this.products = []
        this.number = []; this.customer = 1; this.product = 1; this.profit = 0
        this.validNumber = /^[0-9]+$/; this.status = 1; this.enableUndo = false
        this.statusTitle = ["Your Transaction was Successful", "Your Transaction was Unsuccessful"]
        this.statusMessage = ["Customer or Product not selected", "Credit Limit Exceeded",
            "Not enough stock available", "Wrong input in Paid Amount", "Thank You!!"]; this.message = 1
    }

    componentWillMount() {
        var customers = DB.selectAll("customers")
        var products = DB.selectAll("products")
        var stock = DB.selectField("products", "stock", "product_id", 1)
        var number = []
        for (var i = 1; i < 101; i++) {
            number.push(i)
        }
        if (stock >= 1) var validate = "success"
        else validate = "error"
        this.setState({
            validate: validate,
            stock: stock
        })
        this.customers = customers
        this.products = products
        this.number = number
        this.getPrice()
    }

    getPrice = () => {
        var stock = DB.selectField("products", "stock", "product_id", this.product)
        if (stock >= 1) var validate = "success"
        else validate = "error"
        this.setState({
            validate: validate,
            stock: stock
        })
        if (this.customers.length === 0 || this.products.length === 0) {
            return
        }
        var price = DB.selectField("products", "price", "product_id", this.product)
        var custom = DB.selectField("prices", "p" + this.product, "customers", this.customer)
        if (parseInt(custom, 10) !== 0) price = custom
        price = parseInt(price, 10) * parseInt(this.size, 10)
        
        if (this.state.checked && !this.state.disable)
            this.paid = price.toString()
            
        else if (!this.state.checked && !this.state.disable)
            this.paid = "0"
            
        this.setState({
            price: price,
            balance: price - parseInt(this.paid, 10)
        })
        var costP = DB.selectField("products", "cost_price", "product_id", this.product)
        this.profit = parseInt(price, 10) - (parseInt(costP, 10) * parseInt(this.size, 10))
    }

    onCheck = () => {
        this.setState({
            checked: !this.state.checked
        }, () => this.getPrice())
    }

    selectCustomer = (e) => {
        e.preventDefault()
        if (!e.target.value) return
        this.customer = e.target.value 
        this.getPrice()
    }

    selectProduct = (e) => {
        e.preventDefault()
        if (!e.target.value) return
        this.product = e.target.value
        this.getPrice()
    }

    selectNumber = (e) => {
        e.preventDefault()
        if (!e.target.value) return
        if (parseInt(this.state.stock, 10) >= e.target.value) var validate = "success"
        else validate = "error"
        this.size = e.target.value
        this.setState({ validate: validate }, () => this.getPrice())
    }

    setPaid = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            this.paid = e.target.value
            this.setState({ valid: "success", disable: false }, () => this.getPrice())
            return
        }
        if (!e.target.value.match(this.validNumber)) {
            this.paid = e.target.value
            this.setState({ valid: "error" }, () => this.getPrice())
            return
        }
        if (parseInt(e.target.value, 10) < 0 || parseInt(e.target.value, 10) > this.state.price) {
            this.paid = e.target.value
            this.setState({ valid: "error" }, () => this.getPrice())
            return
        }
        this.paid = e.target.value
        this.setState({ valid: "success", disable: true }, () => this.getPrice())
    }

    create = () => {
        var values = ["NULL", this.customer, this.product, 
            this.size, this.state.price, this.paid, 
            this.state.balance, this.profit, this.state.date
        ]
        if (this.customers.length === 0 || this.products.length === 0) {
            this.status = 1
            this.message = 0
            this.setState({ open: true })
            return
        }
        if (parseInt(this.paid, 10) < 0 || parseInt(this.paid, 10) > this.state.price) {
            this.status = 1
            this.message = 3
            this.setState({ open: true })
            return
        }
        if (parseInt(this.state.stock, 10) < this.size) {
            this.status = 1
            this.message = 2
            this.setState({ open: true })
            return
        }
        if (!this.paid.match(this.validNumber)) {
            this.status = 1
            this.message = 3
            this.setState({ open: true })
            return
        }
        var debt = parseInt(DB.selectField("customers", "debt", "customer_id", this.customer), 10)
        var limit = parseInt(DB.selectField("customers", "credit_limit", "customer_id", this.customer), 10)

        if (this.state.balance > 0 && parseInt(debt, 10) + this.state.balance > parseInt(limit, 10)) {
            this.status = 1
            this.message = 1
            this.setState({ open: true })
            return
        }
        DB.insert("transactions", values)
        var currentStock = parseInt(this.state.stock, 10) - this.size
        DB.updateRow("products", "stock", currentStock, "product_id", this.product)
        if (this.state.balance > 0) {
            DB.updateRow("customers", "debt", this.state.balance + debt, "customer_id", this.customer)
        }
        var sale_ID = DB.selectColumn("transactions", "transaction_id").pop()[0]
        DB.insert("stocks", ["r" + sale_ID, this.product, -this.size, this.state.stock,
            currentStock, new Date().toISOString().substring(0, 10).replace(/\//g, '-')
        ])
        this.enableUndo = true
        this.status = 0; this.message = 4
        this.setState({ open: true })
        this.getPrice()
    }

    undo = () => {
        this.setState({open: false})
        this.enableUndo = false
        var sale_ID = DB.selectColumn("transactions", "transaction_id").pop()[0]
        var stock = DB.selectField("products", "stock", "product_id", this.product)
        var debt = DB.selectField("customers", "debt", "customer_id", this.customer)
        if (this.state.balance > 0) {
            DB.updateRow("customers", "debt", debt - this.state.balance, "customer_id", this.customer)
        }
        DB.updateRow("products", "stock", parseInt(stock, 10) + parseInt(this.size, 10), "product_id", this.product)
        DB.deleteRow("transactions", "transaction_id", sale_ID)
        DB.deleteRow("stocks", "entry_id", "r" + sale_ID)
        this.setState({ open: true })
        this.status = 0; this.message = 4
        this.getPrice()
    }

    snackbar = () => {
        return(
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}
                open={this.state.open} autoHideDuration={600000} onClose={() => this.setState({open: false})}
                message={<span id="message-id" style={{fontSize: '14px'}}>{this.statusTitle[this.status]}</span>}
                action={[
                    <Button color="secondary" size="small" style={{fontSize: '14px'}}>
                        {this.statusMessage[this.message]}
                    </Button>,
                    this.enableUndo && <Button color="secondary" size="small" onClick={this.undo} style={{fontSize: '14px'}}>
                        Undo
                    </Button>,
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => {this.setState({open: false}); this.enableUndo = false}}
                    >
                        <CloseIcon />
                    </IconButton>
                ]}
            />
        )
    }

    render() {
        var sortedCustomers = this.customers.sort((a, b) => {return a[1].localeCompare(b[1])})
        const customers = sortedCustomers.map((customer) => {
            return(
                <MenuItem value={customer[0]}>{customer[1]}</MenuItem>
            )
        })
        var sortedProducts = this.products.sort((a, b) => {return a[1].localeCompare(b[1])})
        const products = sortedProducts.map((product) => {
            return(
                <MenuItem value={product[0]}>{product[1]}</MenuItem>
            )
        })
        const numbers =  this.number.map((number) => {
            return(
                <MenuItem id={number} value={number}>{number}</MenuItem>
            )
        })
        return(
            <div className="container-fluid pll" style={{marginBottom: 138}} >
                <PageHeader>New Transaction <small>Place Order</small></PageHeader>
                <this.snackbar/>
                <div className="row">
                    <div className="col-md-6 left-align">
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>Customer Name</ControlLabel>
                            <Select
                                placeholder="select"
                                value={this.customer}
                                onClick={this.selectCustomer}
                                style={{width: '100%'}}
                            >
                                {customers}
                            </Select>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup controlId="formControlsSelect">
                            <ControlLabel>Product Name</ControlLabel>
                            <Select
                                placeholder="select"
                                value={this.product}
                                onClick={this.selectProduct}
                                style={{width: '100%'}}
                            >
                                {products}
                            </Select>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup controlId="formControlsSelect" validationState={this.state.validate}>
                            <ControlLabel>Number</ControlLabel>
                            <Select
                                placeholder="select"
                                value={this.size}
                                onClick={this.selectNumber}
                                style={{width: '100%'}}
                            >
                                {numbers}
                            </Select>
                            <HelpBlock>{this.state.stock} Cartons Available</HelpBlock>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup>
                            <ControlLabel>Price</ControlLabel>
                            <Well bsSize="small">{this.state.price}</Well>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup validationState={this.state.valid}>
                            <ControlLabel>Amount Paid</ControlLabel>
                            <InputGroup>
                                <InputGroup.Addon>
                                    <Checkbox onChange={this.onCheck} disabled={this.state.disable} style={{width: 'initial', height: 'initial'}} />
                                </InputGroup.Addon>
                                <InputGroup.Addon>NGN</InputGroup.Addon>
                                <FormControl type="text" id = "amount"placeholder={this.state.price} onChange={this.setPaid}/>
                                <InputGroup.Addon>.00</InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup>
                            <ControlLabel>Balance</ControlLabel>
                            <Well bsSize="small">{this.state.balance}</Well>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup>
                            <ControlLabel>Date</ControlLabel>
                            <Well bsSize="small">{this.state.date}</Well>
                        </FormGroup>
                    </div>
                </div>
                <Button variant="fab" color="secondary" className="fab" onClick={this.create}>
                    <SaveIcon />
                </Button>
                <Button variant="fab" color="default" className="fabi" onClick={() => this.props.history.goBack()}>
                    <ArrowBackIcon />
                </Button>
            </div>
        )
    }
}

export default withRouter(TransactionCreate);