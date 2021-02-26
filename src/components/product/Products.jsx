import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { Table, PageHeader } from 'react-bootstrap';
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DB from '../../api/DbFunctions'


class Products extends Component {

    constructor(props) {
        super()
        this.products = []
    }

    componentWillMount() {
        var products = DB.selectAll("products")
        this.products = products
    }

    render() {
        var num = 1
        var sortedProducts = this.products.sort((a, b) => {return a[1].localeCompare(b[1])})
        const products = sortedProducts.map((product) => {
        var count = 1
        return(
            <tr className="left-align tables">
                <td>{num++}</td>
                <td id={product[0]} onClick={() => {}}>
                <Link to={"/productDetails/" + product[0]}>
                    {product[count++]}
                </Link>
                </td>
                <td>{product[count++]}</td>
                <td>{product[++count]}</td>
            </tr>
        )
        })
        
        return (
            <div className="container-fluid">
                <PageHeader>Inventory <small>All Products</small></PageHeader>
                <Paper style={{marginTop: 30, marginBottom: 138}}>
                    <Table responsive striped condensed hover>
                        <thead>
                            <tr>
                                <th className="head-left-table">#</th>
                                <th className="head-table">Name</th>
                                <th className="head-table">Price</th>
                                <th className="head-right-table">Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products}
                        </tbody>
                    </Table>
                </Paper>
                {!this.props.lock && <Button variant="fab" color="primary" aria-label="add" className="fab" onClick={() => this.props.history.push("/productCreate/0")}>
                    <AddIcon />
                </Button>}
            </div>
        );
    }
}

export default withRouter(Products);
