import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { PageHeader } from 'react-bootstrap'
import Paper from '@material-ui/core/Paper'
import DB from '../../api/DbFunctions'
import Transactions from '../transaction/Transactions'
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


class CustomerDetails extends Component {

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
                            <PageHeader>Customer <small>Details</small></PageHeader>
                            <Paper>
                                <div className="bs-callout bs-callout-info">
                                    <h4>NAME</h4>
                                    <p>{DB.selectField("customers", "name", "customer_id", this.id)}</p>
                                </div>
                            </Paper>
                            <Paper>
                                <div className="bs-callout bs-callout-info">
                                    <h4>CONTACT</h4>
                                    <p>{DB.selectField("customers", "phone_number", "customer_id", this.id)}</p>
                                </div>
                            </Paper>
                            <Paper>
                                <div className="bs-callout bs-callout-info">
                                    <h4>CREDIT LIMIT</h4>
                                    <p>{DB.selectField("customers", "credit_limit", "customer_id", this.id)}</p>
                                </div>
                            </Paper>
                            <Paper style={{marginBottom: 138}}>
                                <div className="bs-callout bs-callout-info">
                                    <h4>DEBT</h4>
                                    <p>{DB.selectField("customers", "debt", "customer_id", this.id)}</p>
                                </div>
                            </Paper>
                        </div>
                        <div className="col-md-8">
                            <PageHeader>
                            Recent Purchases <small>
                                By {"  " + DB.selectField("customers", "name", "customer_id", this.id)}
                            </small>
                            </PageHeader>
                            <Transactions column="customer_id" id={this.id} part={true}/>
                        </div>
                    </div>
                </div>
                {!this.props.lock && <Button variant="fab" color="secondary" className="fab" onClick={() => this.props.history.push("/customerCreate/" + this.id)}>
                    <EditIcon />
                </Button>}
                <Button variant="fab" color="default" className="fabi" onClick={() => this.props.history.goBack()}>
                    <ArrowBackIcon />
                </Button>
            </div>
        );
    }
}

export default withRouter(CustomerDetails);
