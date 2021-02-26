import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import DB from '../../api/DbFunctions'
import { FormControl, FormGroup, PageHeader, ControlLabel } from 'react-bootstrap';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


class CustomerCreate extends Component {
    
    constructor(props) {
        super()
        this.state = {
            defaultName: "",
            defaultContact: "",
            defaultCDT: 0,
            open: false,
            validateName: "null",
            validateCDT: "null"
        }
        this.defaultName = ""; this.defaultContact = ""; this.name = ""
        this.validName = /^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$/; this.validNumber = /^[0-9]+$/
        this.contact = ""; this.credit_limit = "0";
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
        var customer = DB.selectRow("customers", "customer_id", this.id)[0]
        this.defaultName = customer[1]
        this.name = customer[1]
        this.defaultContact = customer[2]
        this.contact = customer[2]
        this.credit_limit = customer[3].toString()
        this.setState({
            defaultName: customer[1],
            defaultContact: customer[2],
            defaultCDT: customer[3].toString()
        })
    }

    setName = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            if (this.edit) this.name = this.defaultName
            this.setState({ validateName: "null" })
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

    setContact = (e) => {
        e.preventDefault()
        if (e.target.value === "" && this.edit) {
            this.contact = this.defaultContact
            return
        }
        this.contact = e.target.value
    }

    setCDT = (e) => {
        e.preventDefault()
        if (e.target.value === "") {
            this.credit_limit = this.state.defaultCDT
            this.setState({ validateCDT: "null" })
            return
        }
        if (!e.target.value.match(this.validNumber)) {
            this.setState({ validateCDT: "error" })
            this.credit_limit = e.target.value
            return
        }
        this.setState({ validateCDT: "success" })
        this.credit_limit = e.target.value
    }

    confirm = () => {
        if (!this.name.match(this.validName) || this.name === "" || !this.credit_limit.match(this.validNumber)) {
            this.setState({ open: true })
            this.status = 1; this.message = 0
            return
        }
        var columns = ["name", "phone_number", "credit_limit"]
        var values = [this.name, this.contact, this.credit_limit]
        if (this.edit)
            DB.updateRow("customers", columns, values, "customer_id", this.id)
        else {
            values = ["NULL", this.name, this.contact, this.credit_limit, 0]
            DB.insert("customers", values)
            var productNumber = DB.selectColumn("products", "product_id").length
            var customer_ID = DB.selectColumn("customers", "customer_id").pop()
            var value = [customer_ID]
            for(var i = 0; i < productNumber; i++) {
                value.push(0)
            }
            DB.insert("prices", value)
        }
        this.setState({ open: true })
        this.status = 0; this.message = 1
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

    render() {

        if (this.edit) {
            return (
                <div className="container-fluid" style={{marginBottom: 138}}>
                    <PageHeader>Update Customer <small>Edit</small></PageHeader>
                    <this.snackbar/>
                    <div className="row">
                        <div className="col-md-6 left-align">
                            <FormGroup validationState={this.state.validateName}>
                                <ControlLabel>Customer Name</ControlLabel>
                                <FormControl type="text" placeholder={this.state.defaultName} onChange={this.setName} disabled={this.lock}/>
                            </FormGroup>
                        </div>
                        <div className="col-md-6 left-align">
                            <FormGroup>
                                <ControlLabel>Contact Details</ControlLabel>
                                <FormControl type="text" placeholder={this.state.defaultContact} onChange={this.setContact} disabled={this.lock}/>
                            </FormGroup>
                        </div>
                        <div className="col-md-6 left-align">
                            <FormGroup validationState={this.state.validateCDT}>
                                <ControlLabel>Credit Limit</ControlLabel>
                                <FormControl type="text" placeholder={this.state.defaultCDT} disabled={this.props.lock} onChange={this.setCDT} />
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
                <PageHeader>New Customer <small>Register</small></PageHeader>
                <this.snackbar/>
                <div className="row">
                    <div className="col-md-6 left-align">
                        <FormGroup validationState={this.state.validateName}>
                            <ControlLabel>Customer Name</ControlLabel>
                            <FormControl id="name" type="text" placeholder="name" onChange={this.setName}/>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup>
                            <ControlLabel>Contact Details</ControlLabel>
                            <FormControl id="contact" type="text" placeholder="phone number" onChange={this.setContact}/>
                        </FormGroup>
                    </div>
                    <div className="col-md-6 left-align">
                        <FormGroup>
                            <ControlLabel>Credit Limit</ControlLabel>
                            <FormControl type="text" placeholder="0" disabled={true}/>
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

export default withRouter(CustomerCreate);