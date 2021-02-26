import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import DB from '../../api/DbFunctions'
import { FormControl, FormGroup, PageHeader, ControlLabel, HelpBlock, InputGroup } from 'react-bootstrap';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


class ProductCreate extends Component {

    constructor(props) {
        super()
        this.state = {
            success: false,
            error: false,
            validateStock: "null",
            validateName: "null",
            validatePrice: "null",
            validateCostPrice: "null",
            open: false
        }
        this.name = ""; this.price = ""; this.stock = "0"; this.costprice = ""
        this.validName = /^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$/; this.validNumber = /^[0-9]+$/
        this.statusTitle = ["Your Transaction was Successful", "Your Transaction was Unsuccessful"]
        this.statusMessage = ["Wrong input", "Thank You!!"]; this.message = 1; this.status = 1
    }

    componentWillMount() {
        if (this.props.match.params.value !== "0"){
            this.edit = true
            this.id = this.props.match.params.value
            this.getCurrent()
        }
        else this.edit = false
    }

    getCurrent = () => {
        var product = DB.selectRow("products", "product_id", this.id)[0]
        this.defaultName = product[1]
        this.defaultCostPrice = product[3].toString()
        this.defaultPrice = product[2].toString()
        this.defaultStock = product[4]
        this.name = product[1]
        this.costprice = product[3].toString()
        this.price = product[2].toString()
    }

    setName = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            if (this.edit) {
                this.name = this.defaultName
                return
            }
            this.setState({ validateName: "error" })
            return
        }
        if (!e.target.value.match(this.validName)) {
            this.setState({ validateName: "error" })
            this.name = e.target.value
            return
        }
        this.setState({ validateName: "success" })
        this.name = e.target.value
    }

    setPrice = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            if (this.edit) this.price = this.defaultPrice
            this.setState({ validatePrice: "null" })
            return
        }
        if (!e.target.value.match(this.validNumber)) {
            this.setState({ validatePrice: "error" })
            this.price = e.target.value
            return
        }
        if (parseInt(e.target.value, 10) < 0) {
            this.setState({ validatePrice: "error" })
            this.price = e.target.value
            return
        }
        this.setState({ validatePrice: "success" })
        this.price = e.target.value
    }

    setCostPrice = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            if (this.edit) this.costprice = this.defaultCostPrice
            this.setState({ validateCostPrice: "null" })
            return
        }
        if (!e.target.value.match(this.validNumber)) {
            this.setState({ validateCostPrice: "error" })
            this.costprice = e.target.value
            return
        }
        if (parseInt(e.target.value, 10) < 0) {
            this.setState({ validateCostPrice: "error" })
            this.costprice = e.target.value
            return
        }
        this.setState({ validateCostPrice: "success" })
        this.costprice = e.target.value
    }

    setStock = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            if (this.edit) this.stock = "0"
            this.setState({ validateStock: "null" })
            return
        }
        if (!e.target.value.match(this.validNumber)) {
            this.setState({ validateStock: "error" })
            this.stock = e.target.value
            return
        }
        if (parseInt(e.target.value, 10) < 0) {
            this.setState({ validateStock: "error" })
            this.stock = e.target.value
            return
        }
        if (this.edit) {
            this.setState({ validateStock: "success" })
            this.stock = e.target.value
            
            return
        }
        this.setState({ validateStock: "success" })
        this.stock = e.target.value
    }

    confirm = () => {
        var columns = ["name", "price", "cost_price", "stock"]
        var values = [this.name, this.price, this.costprice, this.stock]
        if (!this.price.match(this.validNumber) || !this.stock.match(this.validNumber)) {
            this.setState({ open: true })
            this.status = 1; this.message = 0
            return
        }
        if (parseInt(this.price, 10) < 0 || parseInt(this.stock, 10) < 0) {
            this.setState({ open: true })
            this.status = 1; this.message = 0
            return
        }

        var currentStock = this.defaultStock + parseInt(this.stock, 10)
        if (this.edit) {
            values = [this.name, this.price, this.costprice, currentStock]
            DB.updateRow("products", columns, values, "product_id", this.id)
            if (this.stock > 0) {
                var stocksData = DB.selectRow("stocks", "product_id", this.id)
                var last = 0
                for (var i = 0; i < stocksData.length; i++) {
                    if (stocksData[i][0][0] === "a")
                        last = parseInt(stocksData[i][0].slice(1,), 10)
                }
                DB.insert("stocks", ["a" + (last + 1), this.id, this.stock, this.defaultStock, 
                    currentStock, new Date().toISOString().substring(0, 10).replace(/\//g, '-')
                ])
            }
        }

        else {
            values = ["NULL", this.name, this.price, this.costprice, this.stock]
            DB.insert("products", values)
            var product_ID = DB.selectColumn("products", "product_id").pop()[0]
            var customer_ID = DB.selectColumn("customers", "customer_id")
            DB.addColumn("prices", "p" + product_ID)
            for (i = 0; i < customer_ID.length; i++) {
                DB.updateRow("prices", "p" + product_ID, 0, "customers", customer_ID[i])
            }
            if (this.stock > 0) {
                stocksData = DB.selectRow("stocks", "product_id", product_ID)
                last = 0
                for (i = 0; i < stocksData.length; i++) {
                    if (stocksData[i][0][0] === "a")
                        last = parseInt(stocksData[i][0].slice(1,), 10)
                }
                DB.insert("stocks", ["a" + (last + 1), product_ID, this.stock, 0, this.stock, 
                    new Date().toISOString().substring(0, 10).replace(/\//g, '-')
                ])
            }
        }
        this.setState({ open: true })
        this.status = 0; this.message = 1
    }

    snackbar = () => {
        return(
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'left'}}
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

    render() {
        if (this.edit) {
            return (
                <div className="container-fluid" style={{marginBottom: 138}}>
                    <PageHeader>Update Product <small>Edit</small></PageHeader>
                    <this.snackbar/>
                    <div className="row">
                        <div className="col-md-6 left-align">
                            <FormGroup validationState={this.state.validateName}>
                                <ControlLabel>Product Name</ControlLabel>
                                <FormControl type="text" placeholder={this.defaultName} onChange={this.setName}/>
                            </FormGroup>
                        </div>
                        <div className="col-md-6 left-align">
                            <FormGroup validationState={this.state.validateCostPrice}>
                                <ControlLabel>Cost Price</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon>NGN</InputGroup.Addon>
                                    <FormControl type="text" placeholder={this.defaultCostPrice} onChange={this.setCostPrice}/>
                                    <InputGroup.Addon>.00</InputGroup.Addon>
                                </InputGroup>
                            </FormGroup>
                        </div>
                        <div className="col-md-6 left-align">
                            <FormGroup validationState={this.state.validatePrice}>
                                <ControlLabel>Selling Price</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon>NGN</InputGroup.Addon>
                                    <FormControl type="text" placeholder={this.defaultPrice} onChange={this.setPrice}/>
                                    <InputGroup.Addon>.00</InputGroup.Addon>
                                </InputGroup>
                            </FormGroup>
                        </div>
                        <div className="col-md-6 left-align">
                            <FormGroup validationState={this.state.validateStock}>
                                <ControlLabel>Add Stock</ControlLabel>
                                <FormControl type="text" placeholder="0" onChange={this.setStock}/>
                                <HelpBlock>Please Create New Sale to Reduce Stock</HelpBlock>
                            </FormGroup>
                        </div>
                    </div>
                    <Button variant="fab" color="default" className="fab" onClick={this.confirm}>
                        <SaveIcon />
                    </Button>
                    <Button variant="fab" color="default" className="fabi" onClick={() => this.props.history.goBack()}>
                        <ArrowBackIcon />
                    </Button>
                </div>
            )
        }

        return(
            <div className="container-fluid" style={{marginBottom: 138}}>
                <PageHeader>New Product <small>Register</small></PageHeader>
                <this.snackbar/>
                <div className="row">
                    <div className="col-md-6 left-align">
                        <FormGroup validationState={this.state.validateName}>
                            <ControlLabel>Product Name</ControlLabel>
                            <FormControl type="text" placeholder="name" onChange={this.setName}/>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup validationState={this.state.validateCostPrice}>
                            <ControlLabel>Cost Price</ControlLabel>
                            <InputGroup>
                                <InputGroup.Addon>NGN</InputGroup.Addon>
                                <FormControl type="text" placeholder={"cost price"} onChange={this.setCostPrice}/>
                                <InputGroup.Addon>.00</InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup validationState={this.state.validatePrice}>
                            <ControlLabel>Selling Price</ControlLabel>
                            <InputGroup>
                                <InputGroup.Addon>NGN</InputGroup.Addon>
                                <FormControl type="text" placeholder="price" onChange={this.setPrice}/>
                                <InputGroup.Addon>.00</InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup validationState={this.state.validateStock}>
                            <ControlLabel>Stock</ControlLabel>
                            <FormControl type="text" placeholder="stock" onChange={this.setStock}/>
                        </FormGroup>
                    </div>
                </div>
                <Button variant="fab" color="default" className="fab" onClick={this.confirm}>
                    <SaveIcon />
                </Button>
                <Button variant="fab" color="default" className="fabi" onClick={() => this.props.history.goBack()}>
                    <ArrowBackIcon />
                </Button>
            </div>
        )
    }
}

export default withRouter(ProductCreate);