import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PrintIcon from '@material-ui/icons/Print';
import TimelineIcon from '@material-ui/icons/Timeline';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import PropTypes from 'prop-types';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { ControlLabel, FormControl, FormGroup, InputGroup, Modal, PageHeader, Pager, Table, Well } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import DB from '../../api/DbFunctions';
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const shell = electron.remote.shell;
const dialog = electron.remote.dialog
const win = electron.remote.getCurrentWindow()


const actionsStyles = theme => ({
    root: {
        flexShrink: 0,
        color: theme.palette.text.secondary,
        marginLeft: theme.spacing.unit * 2.5,
    },
});
  
class TablePaginationActions extends React.Component {
    handleFirstPageButtonClick = event => {
        this.props.onChangePage(event, 0);
    };

    handleBackButtonClick = event => {
        this.props.onChangePage(event, this.props.page - 1);
    };

    handleNextButtonClick = event => {
        this.props.onChangePage(event, this.props.page + 1);
    };

    handleLastPageButtonClick = event => {
        this.props.onChangePage(
        event,
        Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
        );
    };

    render() {
        const { classes, count, page, rowsPerPage, theme } = this.props;

        return (
        <div className={classes.root} >
            <IconButton
            onClick={this.handleFirstPageButtonClick}
            disabled={page === 0}
            aria-label="First Page"
            >
            {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
            onClick={this.handleBackButtonClick}
            disabled={page === 0}
            aria-label="Previous Page"
            >
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
            onClick={this.handleNextButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="Next Page"
            >
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
            onClick={this.handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="Last Page"
            >
            {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </div>
        );
    }
}

TablePaginationActions.propTypes = {
    classes: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    theme: PropTypes.object.isRequired,
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
    TablePaginationActions,
);



class Transactions extends Component {
    constructor(props) {
        super()
        this.state = {
            current: 1,
            disablePrev: true,
            disableNext: true,
            edit: false,
            open: false,
            summary: false,
            stats: [],
            checked: false,
            currentPage: 0,
            rows: 10
        }
        this.transactions = []; this.P_id = 0; this.C_id = 0; this.container = ""; this.summary = []
        this.years = []; this.current = 0; this.sale = 0; this.validNumber = /^[0-9]+$/
        this.months = []; this.disableNext = true; this.disablePrev = true; 
        this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        this.intervals = []
    }

    componentWillMount() {
        if (!this.props.part && !this.props.lock) {
            this.setState({summary: true})
        }
        this.previousSelect = 0
        this.customers = DB.selectColumn("customers", "name")
        this.products = DB.selectColumn("products", "name")
        this.updateTransactions()
    }

    updateTransactions = () => {
        if (this.props.part === true) {
            this.updateSpecial()
            return
        }

        this.months = []; this.disableNext = true; this.disablePrev = true
        this.container = "container-fluid"
        var dates = DB.selectColumn("transactions", "date")
        var lastMonth = ""
        for(var i = 0; i < dates.length; i++) {
            var d = dates[i][0].slice(0, 7)
            if (lastMonth === d) continue
            lastMonth = d
            this.months.push(d)
        }
        if (this.months.length === 0) {
            var month = new Date().toISOString().substring(0, 7).replace(/\//g, '-')
            this.page = this.monthNames[parseInt(month.slice(6, 7), 10) -1] + " " + month.slice(0, 4)
            this.transactions = []
            this.fix()
            this.updateSummary()
            return
        }

        this.months = this.months.reverse()
        
        if (this.months.length > 1) {
            this.disablePrev = false
        }
        var page = this.months[this.current]
        this.page = this.monthNames[parseInt(page.slice(6, 7), 10) -1] + " " + page.slice(0, 4)
        this.transactions = DB.selectBetween("transactions", "date", page + "-01", page + "-31").reverse()
        this.fix()
        this.updateSummary()
    }

    updateSpecial = () => {
        this.setState({summary: false, top: 0, right: 0, left: 0})
        this.months = []; this.index = 2
        if (this.props.column === "customer_id") this.index = 1
        this.container = "container-fluid"
        var dates = DB.selectColumnWhere("transactions", "date", this.props.column, this.props.id)
        var lastMonth = ""
        for(var i = 0; i < dates.length; i++) {
            var d = dates[i][0].slice(0, 7)
            if (lastMonth === d) continue
            lastMonth = d
            this.months.push(d)
        }
        if (this.months.length === 0) {
            var month = new Date().toISOString().substring(0, 7).replace(/\//g, '-')
            this.page = this.monthNames[parseInt(month.slice(6, 7), 10) -1] + " " + month.slice(0, 4)
            this.transactions = []
            this.updateSummary()
            return
        }

        this.months = this.months.reverse()
        
        if (this.months.length > 1) {
            this.disablePrev = false
        }
        var page = this.months[this.current]
        this.page = this.monthNames[parseInt(page.slice(6, 7), 10) -1] + " " + page.slice(0, 4)
        var sales = DB.selectBetween("transactions", "date", page + "-01", page + "-31").reverse()
        for (var j = 0; j < sales.length; j++) {
            if (sales[j][this.index] === parseInt(this.props.id, 10))
                this.transactions.push(sales[j])
        }
        this.updateSummary()
    }

    updateSummary = () => {
        this.summary = []; var days = []; var total = new Array(3);
        for (var i = 0; i < this.transactions.length; i++) {
            if (days.indexOf(this.transactions[i][8]) === -1) {
                days.push(this.transactions[i][8])
            }
        }
        var profit = 0, debt = 0, returns = 0
        total[0] = 0; total[1] = 0; total[2] = 0
        for (var j = 0; j < days.length; j++) {
             profit = 0; debt = 0; returns = 0
            for (var k = 0; k < this.transactions.length; k++) {
                if (days[j] === this.transactions[k][8]) {
                    profit += parseInt(this.transactions[k][7], 10);
                    returns += parseInt(this.transactions[k][4], 10);
                    debt += parseInt(this.transactions[k][6], 10);
                }
            }
            total[2] += profit 
            total[0] += returns
            total[1] += debt
            this.summary.push([days[j], returns, debt, profit])
        }
        this.summary.reverse()
        this.total = total
    }

    next = (e) => {
        e.preventDefault()
        this.current--
        if (this.current === 0) {
            this.disableNext = true; this.disablePrev = false
        }
        else {
            this.disableNext = false; this.disablePrev = false
        }
        var page = this.months[this.current]
        this.page = this.monthNames[parseInt(page.slice(6, 7), 10) -1] + " " + page.slice(0, 4)
        this.transactions = DB.selectBetween("transactions", "date", this.months[this.current] + "-01", this.months[this.current] + "-31").reverse()
        if (this.props.part) {
            var sales = this.transactions
            this.transactions = []
            for (var j = 0; j < sales.length; j++) {
                if (sales[j][this.index] === parseInt(this.props.id, 10))
                    this.transactions.push(sales[j])
            }
        }
        this.updateSummary()
        this.fix()
    }

    prev = (e) => {
        e.preventDefault()
        this.current++
        if (this.current === this.months.length - 1) {
            this.disableNext = false; this.disablePrev = true
        }
        else {
            this.disableNext = false; this.disablePrev = false
        }
        var page = this.months[this.current]
        this.page = this.monthNames[parseInt(page.slice(6, 7), 10) -1] + " " + page.slice(0, 4)
        this.transactions = DB.selectBetween("transactions", "date", this.months[this.current] + "-01", this.months[this.current] + "-31").reverse()
        if (this.props.part) {
            var sales = this.transactions
            this.transactions = []
            for (var j = 0; j < sales.length; j++) {
                if (sales[j][this.index] === parseInt(this.props.id, 10))
                    this.transactions.push(sales[j])
            }
        }
        this.updateSummary()
        this.fix()
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

    getPrice = () => {
        var price = DB.selectField("transactions", "balance", "transaction_id", this.sale)
        price = parseInt(price, 10)
        
        if (this.state.checked && !this.state.disable)
            this.paid = price.toString()
            
        else if (!this.state.checked && !this.state.disable)
            this.paid = "0"
            
        this.setState({
            price: price,
            balance: price - parseInt(this.paid, 10)
        })
    }

    onCheck = () => {
        this.setState({
            checked: !this.state.checked
        }, () => this.getPrice())
    }

    onSelect = (e) => {
        e.preventDefault()
        var current = this.id.indexOf(parseInt(e.target.id, 10))
        if (parseInt(e.target.id, 10) === this.sale) {
            this.stats[current] = !this.stats[current]
        }
        else {
            this.stats[this.previousSelect] = false
            this.stats[current] = !this.stats[current]
        }
        this.setState({stats: this.stats, visible: 'hidden'},() => setTimeout(() => this.setState({visible: 'visible'}), 1))
        this.previousSelect = current
        if (this.stats[current] === true) this.sale = parseInt(e.target.id, 10)
        else this.sale = 0
        var price = DB.selectField("transactions", "balance", "transaction_id", this.sale)
        price = parseInt(price, 10)
        if (price === 0) this.setState({ debt: false })
        else this.setState({ debt: true })
    }

    confirmPayed = () => {
        if (this.sale === 0) return;
        var bal = DB.selectField("transactions", "balance", "transaction_id", this.sale)
        var C_id = DB.selectField("transactions", "customer_id", "transaction_id", this.sale)
        var debt = DB.selectField("customers", "debt", "customer_id", C_id)
        var paid = DB.selectField("transactions", "paid", "transaction_id", this.sale)
        if (!this.paid.match(this.validNumber) || parseInt(this.paid, 10) < 0 || parseInt(this.paid, 10) > bal) {
            this.setState({ error: true })
            return
        }
        DB.updateRow("transactions", ["paid", "balance"], [parseInt(this.paid, 10) + parseInt(paid, 10),
            parseInt(bal, 10) - parseInt(this.paid, 10)], "transaction_id", this.sale
        )
        DB.updateRow("customers", "debt", parseInt(debt, 10) - parseInt(this.paid, 10), "customer_id", C_id)
        this.setState({ open: true, edit: false, disable: false, valid: false })
        this.paid = 0; this.sale = 0
        this.updateTransactions()
    }

    delete = () => {
        if (this.sale === 0) return; var start = 0
        var size = DB.selectField("transactions", "number", "transaction_id", this.sale)
        var product = DB.selectField("transactions", "product_id", "transaction_id", this.sale)
        var cdt = DB.selectField("transactions", "balance", "transaction_id", this.sale)
        var stock = DB.selectField("products", "stock", "product_id", product)
        var C_id = DB.selectField("transactions", "customer_id", "transaction_id", this.sale)
        var debt = DB.selectField("customers", "debt", "customer_id", C_id)
        DB.updateRow("customers", "debt", parseInt(debt, 10) - parseInt(cdt, 10), "customer_id", C_id)
        DB.updateRow("products", "stock", parseInt(stock, 10) + parseInt(size, 10), "product_id", product)
        var stocksData = DB.selectRow("stocks", "product_id", product)
        for (var i = 0; i < stocksData.length; i++) {
            if (stocksData[i][0] === "r" + this.sale)
                start = i + 1
        }
        DB.deleteRow("transactions", "transaction_id", this.sale)
        DB.deleteRow("stocks", "entry_id", "r" + this.sale)
        for (var j = start; j < stocksData.length; j++) {
            var previous = parseInt(stocksData[j][3], 10)
            var current = parseInt(stocksData[j][4], 10)
            DB.updateRow("stocks", ["previous", "current"], [parseInt(size, 10) + previous, parseInt(size, 10) + current], "entry_id", stocksData[j][0])
        }
        this.setState({ open: true })
        this.sale = 0
        this.updateTransactions()
    }

    fix = () => {
        this.id = []
        for (var j = 0; j < this.transactions.length; j++) {
            this.id.push(this.transactions[j][0])
        }
        this.stats = new Array(this.transactions.length);
        for (var k = 0; k < this.stats.length; k++) {
            this.stats[k] = false
        }
        this.setState({stats: this.stats})
    }

    onEdit = () => {
        if (this.sale === 0) return;
        var price = DB.selectField("transactions", "balance", "transaction_id", this.sale)
        price = parseInt(price, 10)
        if (price === 0) return
        this.getPrice()
        this.setState({edit: true})
    }

    handleChangePage = (event, page) => {
        this.setState({ currentPage: page });
    }
    
    handleChangeRowsPerPage = (event) => {
        this.setState({rows: event.target.value})
    }

    print = (e) => {
        e.preventDefault()
        this.setState({left: 20, right: 20, top: 20, print: true})
        dialog.showSaveDialog(win, {}, (pdfPath) => {
            if (!pdfPath) {
                this.setState({left: '', right: '', top: '', print: false})
                return
            }
            if (pdfPath) {
                win.webContents.printToPDF({marginsType: 0}, (error, data) => {
                    if (error) {
                        dialog.showErrorBox('Error', error);
                        this.setState({left: '', right: '', top: '', print: false})
                        return;
                    }
                    fs.writeFile(pdfPath, data, (err) => {
                        if (err) {
                            dialog.showErrorBox('Error', err);
                            this.setState({left: '', right: '', top: '', print: false})
                            return;
                        }
                        shell.openExternal('file://' + pdfPath)
                        this.setState({left: '', right: '', top: '', print: false})
                    })
                })
            }
        })
    }

    snackbar = () => {
        return(
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}
                open={this.state.open} autoHideDuration={6000} onClose={() => this.setState({open: false})}
                message={<span id="message-id" style={{fontSize: '14px'}}>Success</span>}
                action={[
                    <Button color="secondary" size="small" style={{fontSize: '14px'}}>
                        Records Updated
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

    errorSnackbar = () => {
        return(
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'left',}}
                open={this.state.error} autoHideDuration={6000} onClose={() => this.setState({error: false})}
                message={<span id="message-id" style={{fontSize: '14px'}}>Failed</span>}
                action={[
                    <Button color="secondary" size="small" style={{fontSize: '14px'}}>
                        Wrong Input
                    </Button>,
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => this.setState({error: false})}
                    >
                        <CloseIcon />
                    </IconButton>
                ]}
            />
        )
    }

    editSale = () => {
        return (
            <Modal
                show={this.state.edit}
                onHide={() => this.setState({edit: false, disable: false, valid: false})}
                container={this}
                aria-labelledby="contained-modal-title"
                backdrop={true}
                autoFocus={true}
            >
                <div className="container-fluid" style={{paddingTop: 0}}>
                    <div className="row">
                        <div className="col-md-12 left-align">
                            <FormGroup validationState={this.state.valid} style={{marginTop: 50}} >
                                <ControlLabel>Amount Paid</ControlLabel>
                                <InputGroup>
                                    <InputGroup.Addon>
                                        <Checkbox style={{width: 'initial', height: 'initial'}} onChange={this.onCheck} disabled={this.state.disable}/>
                                    </InputGroup.Addon>
                                    <InputGroup.Addon>NGN</InputGroup.Addon>
                                    <FormControl type="text" id = "amount"placeholder={this.state.price} onChange={this.setPaid}/>
                                    <InputGroup.Addon>.00</InputGroup.Addon>
                                </InputGroup>
                            </FormGroup>
                        </div>
                        <div className="col-md-12 left-align">
                            <FormGroup>
                                <ControlLabel>Balance</ControlLabel>
                                <Well bsSize="small">{this.state.balance}</Well>
                            </FormGroup>
                        </div>
                        <div className="col-md-12 left-align">
                            <Button variant="outlined" color="secondary" onClick={this.confirmPayed} style={{marginBottom: 50}} >Confirm</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }

    summaryView = () => {
        const summary = this.summary.map((day) => {
            return(
                <tr className="left-align tables">
                    <td>{day[0].slice(8,)}</td>
                    <td>{day[1]}</td>
                    <td>{day[2]}</td>
                    <td>{day[3]}</td>
                </tr>
            )
        })

        if (this.state.create) {
            return <this.createTransaction/>
        }
          
        return (
            <div className="container-fluid" style={{marginLeft: this.state.left, marginRight: this.state.right}}>
                {!this.props["part"] && <PageHeader>Daily Summary <small>for the month</small></PageHeader>}
                <h3>{this.page}</h3>
                {!this.state.print && <Pager>
                    <Pager.Item previous disabled={this.disablePrev} onClick={this.prev}>&larr; Previous</Pager.Item>
                    <Pager.Item next disabled={this.disableNext} onClick={this.next}>Next &rarr;</Pager.Item>
                </Pager>}
                <Paper style={{marginTop: 30, marginBottom: 138}}>
                    <Table responsive striped condensed hover bordered={this.state.print} >
                        <thead>
                            <tr>
                                <th className="head-left-table">Day</th>
                                <th className="head-table">Expected Returns</th>
                                <th className="head-table">Oustanding Payments</th>
                                <th className="head-right-table">Expected Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary}
                            <tr className="left-align tables" 
                            style={{color: "#FFF", backgroundColor: "rgb(66, 64, 64)", fontSize: '12px', fontWeight: 100}} >
                                <td style={{borderBottomLeftRadius: 5}} >Total</td>
                                <td>{this.total[0]}</td>
                                <td>{this.total[1]}</td>
                                <td style={{borderBottomRightRadius: 5}} >{this.total[2]}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Paper>
                {!this.state.print && <div><Button variant="fab" color="primary" className="fab" onClick={() => this.props.history.push("/salesCreate")}>
                    <AddIcon />
                </Button>
                <Button variant="fab" color="default" className="fabi" onClick={() => this.setState({summary: false})} >
                    <TimelineIcon />
                </Button>
                <Button variant="fab" color="default" className="fabin" onClick={this.print} >
                    <PrintIcon />
                </Button></div>}
            </div>
        )
    }

    pageView = () => {
        var num = (this.state.currentPage * this.state.rows) + 1
        let hold = this.transactions.slice(this.state.currentPage * this.state.rows, (this.state.currentPage * this.state.rows) + this.state.rows)
        const transactions = hold.map((transaction) => {
            var count =  1
            if (this.props.part) {
                return (
                    <tr className="left-align tables">
                        <td>{num++}</td>
                        <td>
                            {this.customers[parseInt(transaction[count++], 10) - 1][0]}
                        </td>
                        <td>
                            {this.products[parseInt(transaction[count++], 10) - 1][0]}
                        </td>
                        <td>{transaction[count++]}</td>
                        <td>{transaction[count++]}</td>
                        <td>{transaction[count++]}</td>
                        <td>{transaction[count++]}</td>
                        <td>{transaction[count++]}</td>
                        <td>{transaction[count++]}</td>
                    </tr>
                )
            }
            
            return(
                <tr className="left-align tables">
                    <td>{!this.props.lock && <Checkbox style={{width: 'initial', height: 'initial', paddingRight: 8}} id={transaction[0]} checked={!!this.state.stats[num-1]} onClick={this.onSelect} />}{num++}</td>
                    <td id = {transaction[1]} >
                        <Link to={"/customerDetails/" + transaction[1]}>
                            {this.customers[parseInt(transaction[count++], 10) - 1][0]}
                        </Link>
                    </td>
                    <td id = {transaction[2]} >
                        <Link to={"/productDetails/" + transaction[2]}>
                            {this.products[parseInt(transaction[count++], 10) - 1][0]}
                        </Link>
                    </td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                </tr>
            )
        })
        return transactions
    }

    body = () => {
        var num = 1
        let hold = DB.selectBetween("transactions", "date", this.months[this.current] + "-01", this.months[this.current] + "-31")
        const transactions = hold.map((transaction) => {
            var count = 1            
            return(
                <tr className="left-align tables">
                    <td>{num++}</td>
                    <td>{this.customers[parseInt(transaction[count++], 10) - 1][0]}</td>
                    <td>{this.products[parseInt(transaction[count++], 10) - 1][0]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                    <td>{transaction[count++]}</td>
                </tr>
            )
        })
        return transactions
    }

    render() {
        var tables
        if (this.state.print) {
            tables = this.body()
        }
        else tables = this.pageView()
        
        if (this.state.summary) {
            return <this.summaryView/>
        }
        
        return (
            <div className={this.container} style={{marginLeft: this.state.left, marginRight: this.state.right, paddingTop: this.state.top}} >
            {this.state.edit && <this.editSale/>}
            {!this.props["part"] && <PageHeader>Recent Sales <small>All Customers and Products</small></PageHeader>}
            <h3>{this.page}</h3>
            {!this.state.print && <Pager style={{visibility: this.state.visible}}>
                <Pager.Item previous disabled={this.disablePrev} onClick={this.prev}>&larr; Previous</Pager.Item>
                <Pager.Item next disabled={this.disableNext} onClick={this.next}>Next &rarr;</Pager.Item>
            </Pager>}
            <Paper style={{ marginTop: 30, marginBottom: 138 }}>
                <Table responsive striped condensed hover bordered={this.state.print} >
                        <thead>
                            <tr>
                                <th className="head-left-table">#</th>
                                <th className="head-table">Customer</th>
                                <th className="head-table">Product</th>
                                <th className="head-table">Number</th>
                                <th className="head-table">Price</th>
                                <th className="head-table">Paid</th>
                                <th className="head-table">Balance</th>
                                <th className="head-table">Profit</th>
                                <th className="head-right-table">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables}
                        </tbody>
                        {!this.state.print && <TableFooter >
                            <TableRow>
                                <TablePagination
                                colSpan={3}
                                count={this.transactions.length}
                                rowsPerPage={this.state.rows}
                                page={this.state.currentPage}
                                onChangePage={this.handleChangePage}
                                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActionsWrapped}
                                style={{fontSize: 10}}
                                className="table-footer-label"
                                />
                            </TableRow>
                        </TableFooter>}
                    </Table>
                </Paper>
                <Paper style={{ marginBottom: 138}}>
                    <Table responsive striped condensed hover bordered={this.state.print} >
                        <thead>
                            <tr>
                                <th className="head-left-table">#</th>
                                <th className="head-table">Expected Returns</th>
                                <th className="head-table">Oustanding Payments</th>
                                <th className="head-right-table">Expected Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="left-align tables" 
                            style={{fontSize: '12px', fontWeight: 100}} >
                                <td style={{borderBottomLeftRadius: 5}} >Total</td>
                                <td>{this.total[0]}</td>
                                <td>{this.total[1]}</td>
                                <td style={{borderBottomRightRadius: 5}} >{this.total[2]}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Paper>
                {!this.state.print && <div>
                    {(!this.props.part && this.props.lock) && <div>
                        <Button variant="fab" color="primary" className="fab" onClick={() => this.props.history.push("/salesCreate")}>
                            <AddIcon />
                        </Button>
                        <Button variant="fab" color="default" className="fabi" onClick={this.print} >
                            <PrintIcon />
                        </Button>
                    </div>}
                    {(!this.props.part && !this.props.lock) && <div>
                        <Button variant="fab" color="primary" className="fab" onClick={() => this.props.history.push("/salesCreate")}>
                            <AddIcon />
                        </Button>
                        {this.sale !== 0 && <div> 
                            <Button variant="fab" color="secondary" className="del" onClick={this.delete}>
                                <DeleteIcon />
                            </Button>
                            {this.state.debt && <Button variant="fab" color="default" className="faby" onClick={this.onEdit}>
                                <EditIcon />
                            </Button>}
                        </div>}
                        {!this.sale && <Button variant="fab" color="default" className="fabin" onClick={this.print} >
                            <PrintIcon />
                        </Button>}
                        <Button variant="fab" color="default" className="fabi" onClick={() => this.setState({summary: true})} >
                            <DateRangeIcon />
                        </Button>
                    </div>}
                </div>}
                <this.snackbar/>
                <this.errorSnackbar/>
            </div>
        );
    }
}

export default withRouter(Transactions);
