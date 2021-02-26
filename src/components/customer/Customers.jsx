import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import DB from '../../api/DbFunctions'
import { Table, PageHeader } from 'react-bootstrap';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Paper from '@material-ui/core/Paper'


class Customer extends Component {

	constructor(props) {
		super()
		this.customers = []
	}

	componentWillMount() {
		var customers = DB.selectAll("customers")
		this.customers = customers
	}

  	render() {
		var num = 1
		var sortedCustomers = this.customers.sort((a, b) => {return a[1].localeCompare(b[1])})
		const customers = sortedCustomers.map((customer) => {
			var count = 1
			return(
				<tr className="left-align tables">
					<td>{num++}</td>
					<td id={customer[0]} >
					<Link to={'/customerDetails/' + customer[0]} id={customer[0]} >
						{customer[count++]}
					</Link>
					</td>
					<td>{customer[count++]}</td>
					<td>{customer[count++]}</td>
				</tr>
			)
		}) 

		return (
			<div className="container-fluid">
			<PageHeader>Customers <small>All Customers</small></PageHeader>
				<Paper style={{marginTop: 30, marginBottom: 138}}>
					<Table responsive striped condensed hover>
						<thead>
							<tr>
								<th className="head-left-table">#</th>
								<th className="head-table">Name</th>
								<th className="head-table">Contact</th>
								<th className="head-right-table">Credit Limit</th>
							</tr>
						</thead>
						<tbody>
							{customers}
						</tbody>
					</Table>
				</Paper>
				{!this.props.lock && <Button variant="fab" color="primary" aria-label="add" className="fab" onClick={() => this.props.history.push("/customerCreate/0")}>
					<AddIcon />
				</Button>}
			</div>
		);
	}
}

export default withRouter(Customer);
