import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { PageHeader } from 'react-bootstrap'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DB from '../../api/DbFunctions'
import Transactions from '../transaction/Transactions'


class ProductDetails extends Component {

    constructor(props) {
        super()
    }

    componentWillMount() {
        this.lock = this.props.lock
        this.id = this.props.match.params.value
    }
    
    render() {
        return (
            <div>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4">
                            <PageHeader>Product <small>Details</small></PageHeader>
                            <Paper>
                                <div className="bs-callout bs-callout-info">
                                    <h4>NAME</h4>
                                    <p>{DB.selectField("products", "name", "product_id", this.id)}</p>
                                </div>
                            </Paper>
                            <Paper>
                                <div className="bs-callout bs-callout-info">
                                    <h4>COST PRICE</h4>
                                    <p>{DB.selectField("products", "cost_price", "product_id", this.id)}</p>
                                </div>
                            </Paper>
                            <Paper>
                                <div className="bs-callout bs-callout-info">
                                    <h4>SELLING PRICE</h4>
                                    <p>{DB.selectField("products", "price", "product_id", this.id)}</p>
                                </div>
                            </Paper>
                            <Paper style={{marginBottom: 138}}>
                                <div className="bs-callout bs-callout-info">
                                    <h4>STOCK</h4>
                                    <p>{DB.selectField("products", "stock", "product_id", this.id)}</p>
                                </div>
                            </Paper>
                        </div>
                        <div className="col-md-8">
                            <PageHeader>
                                Recent Sales <small>
                                Involving {DB.selectField("products", "name", "product_id", this.id)}
                                </small>
                            </PageHeader>
                            <Transactions column="product_id" id={this.id} part={true}/>
                        </div>
                    </div>
                </div>
                {!this.props.lock && <Button variant="fab" color="secondary" className="fab" onClick={() => this.props.history.push("/productCreate/" + this.id)}>
                    <EditIcon />
                </Button>}
                <Button variant="fab" color="default" className="fabi" onClick={() => this.props.history.goBack()}>
                    <ArrowBackIcon />
                </Button>
            </div>
        );
    }
}

export default withRouter(ProductDetails);
