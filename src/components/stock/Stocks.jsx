import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import DateRangeIcon from '@material-ui/icons/DateRange';
import TimelineIcon from '@material-ui/icons/Timeline';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/core/styles';
import { PageHeader, Pager, Table } from 'react-bootstrap';
import DB from '../../api/DbFunctions';


const actionsStyles = theme => ({
    root: {
        flexShrink: 0,
        fontSize: 14,
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
        <div className={classes.root}>
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



class Stocks extends Component {

    constructor(props) {
        super()
        this.state = {
            detail: false,
            color: "",
            currentPage: 0,
            rows: 10
        }
        this.current = 0; this.sale = 0; this.stocks = []; this.summary = []
        this.months = []; this.disableNext = true; this.disablePrev = true
        this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    }

    componentWillMount() {
        this.updateStocks()
        this.products = DB.selectColumn("products", "name")
        this.rows = 20
    }
  
    updateStocks = () => {
        this.months = []; this.disableNext = true; this.disablePrev = true;
        var dates = DB.selectColumn("stocks", "date")
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
            this.stocks = []
            return
        }

        this.months = this.months.reverse()
        
        if (this.months.length > 1) {
            this.disablePrev = false
        }
        var page = this.months[this.current]
        this.page = this.monthNames[parseInt(page.slice(6, 7), 10) -1] + " " + page.slice(0, 4)
        this.stocks = DB.selectBetween("stocks", "date", page + "-01", page + "-31").reverse()
        this.updateSummary(DB.selectBetween("stocks", "date", page + "-01", page + "-31"))
    }

    updateSummary = (stock) => {
        var names = []; var before = []; var after = []; this.summary = []
        for (var i= 0; i < stock.length; i++) {
            if (names.indexOf(stock[i][1]) === -1) {
                names.push(stock[i][1])
                before.push(stock[i][3])    
            }
        }
        for (var j = 0; j < names.length; j++) {
            var last = 0
            for (var k = 0; k < stock.length; k++) {
                if (stock[k][1] === names[j]) {
                    last = stock[k][4]
                }
            }
            after.push(last)
        }
        for (var l = 0; l < names.length; l++) {
            this.summary.push([DB.selectField("products", "name", "product_id", names[l])[0], before[l], after[l]])
        }
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
        this.stocks = DB.selectBetween("stocks", "date", this.months[this.current] + "-01", this.months[this.current] + "-31").reverse()
        this.updateSummary(DB.selectBetween("stocks", "date", this.months[this.current] + "-01", this.months[this.current] + "-31"))
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
        this.stocks = DB.selectBetween("stocks", "date", this.months[this.current] + "-01", this.months[this.current] + "-31").reverse()
        this.updateSummary(DB.selectBetween("stocks", "date", this.months[this.current] + "-01", this.months[this.current] + "-31"))
    }

    handleChangePage = (event, page) => {
        this.setState({ currentPage: page });
    }
    
    handleChangeRowsPerPage = event => {
        this.setState({rows: event.target.value})
    }

    dayView = () => {
        var Stocks = this.stocks.slice(this.state.currentPage * this.state.rows, (this.state.currentPage * this.state.rows) + this.state.rows)
        const stocks = Stocks.map((stock) => {
            if (stock[2] > 0) {this.color = "green-row"; var number = stock[2]}
            else if (stock[2] < 0) {this.color = "red-row"; number = 0 - stock[2]}
            else {this.color = "purple-row"}
            return (

                <tr className={"left-align tables " + this.color}>
                    <td>{this.products[parseInt(stock[1], 0) - 1][0]}</td>
                    <td >{number}</td>
                    <td>{stock[3]}</td>
                    <td>{stock[4]}</td>
                    <td>{stock[5]}</td>
                </tr>
            )
        })
        

        return (
            <div className="container-fluid" >
                <PageHeader>Stocks <small>Monthly Logs</small></PageHeader>
                <h3>{this.page}</h3>
                <Pager>
                    <Pager.Item previous disabled={this.disablePrev} onClick={this.prev}>&larr; Previous</Pager.Item>
                    <Pager.Item next disabled={this.disableNext} onClick={this.next}>Next &rarr;</Pager.Item>
                </Pager>
                <Paper style={{marginTop: 30, marginBottom: 138}}>
                <Table responsive striped condensed hover >
                    <thead>
                        <tr>
                            <th className="head-left-table">Product</th>
                            <th className="head-table">Number</th>
                            <th className="head-table">Brought Forward</th>
                            <th className="head-table">Current</th>
                            <th className="head-right-table">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks}
                    </tbody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                            colSpan={3}
                            count={this.stocks.length}
                            rowsPerPage={this.state.rows}
                            page={this.state.currentPage}
                            onChangePage={this.handleChangePage}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActionsWrapped}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
                </Paper>
                <Button variant="fab" color="default" className="fab" onClick={() => this.setState({detail: false})} >
                    <DateRangeIcon />
                </Button>
            </div>
        )
    }

    render() {
        var sortedSummary = this.summary.sort((a, b) => {return a[0].localeCompare(b[0])})
        const stocks = sortedSummary.map((stock) => {
            return (
                <tr className="left-align tables ">
                    <td>{stock[0]}</td>
                    <td>{stock[1]}</td>
                    <td>{stock[2]}</td>
                </tr>
            )
        })

        if (this.state.detail) {
            return <this.dayView/>
        }

        return (
            <div className="container-fluid" >
                <PageHeader>Monthly Stocks Summary <small>For Products Altered</small></PageHeader>
                <h3>{this.page}</h3>
                <Pager>
                    <Pager.Item previous disabled={this.disablePrev} onClick={this.prev}>&larr; Previous</Pager.Item>
                    <Pager.Item next disabled={this.disableNext} onClick={this.next}>Next &rarr;</Pager.Item>
                </Pager>
                <Paper style={{marginTop: 30, marginBottom: 138}}>
                <Table responsive striped condensed hover >
                    <thead>
                        <tr>
                            <th className="head-left-table">Product</th>
                            <th className="head-table">Brought Forward</th>
                            <th className="head-right-table">Current</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks}
                    </tbody>
                </Table>
                </Paper>
                <Button variant="fab" color="default" className="fab" onClick={() => this.setState({detail: true})} >
                    <TimelineIcon />
                </Button>
            </div>
        )
    }
}

export default Stocks;
