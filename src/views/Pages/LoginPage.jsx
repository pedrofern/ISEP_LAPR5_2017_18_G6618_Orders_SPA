import React, { Component } from 'react';
import {
    Grid, Row, Col,
    FormGroup, ControlLabel, FormControl
} from 'react-bootstrap';

import * as jwt_decode from 'jwt-decode';

import Card from 'components/Card/Card.jsx';

import Button from 'elements/CustomButton/CustomButton.jsx';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cardHidden: true,
            cardHidden2: true,
            cardTitle: "Login Failed",
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        setTimeout(function () { this.setState({ cardHidden: false }); }.bind(this), 700);
    }

    componentWillMount() {
        localStorage.clear();
    }

    handleSubmit(event) {

        event.preventDefault();
        fetch('https://lapr5-g6618-receipts-management.azurewebsites.net/api/authenticate', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.email.value,
                password: this.password.value,
            }),
        }).then(results => {

            return results.json();
        })
            .then(data => {
                console.log(data);

                if (data.error == null) {
                    const tokenDecoded = jwt_decode(data.token);
                    let userInfo = {
                        id: tokenDecoded.sub,
                        roles: tokenDecoded["https://lapr5.isep.pt/roles"]
                    }
    
                    if (userInfo.roles.includes("supplier") || userInfo.roles.includes("admin")) {
                        localStorage.setItem("token", data.token_type + " " + data.token);

                        this.setState({ cardHidden2: false, cardTitle: "Login Sucessful" })
                        setTimeout(function () { this.props.history.push('/dashboard') }.bind(this), 1000);
                    } else {
                        this.setState({ cardHidden2: false, cardTitle: "Login Failed"})
                    }
                } else {
                    this.setState({ cardHidden2: false, cardTitle: "Login Failed"})
                }

            })
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col md={4} sm={6} mdOffset={4} smOffset={3}>
                        <form onSubmit={this.handleSubmit}>
                            <Card
                                hidden={this.state.cardHidden}
                                textCenter
                                title="Login"
                                content={
                                    <div>
                                        <FormGroup>
                                            <ControlLabel>
                                                Email address
                                            </ControlLabel>
                                            <FormControl
                                                placeholder="Enter email"
                                                type="name"
                                                inputRef={(email) => this.email = email}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <ControlLabel>
                                                Password
                                            </ControlLabel>
                                            <FormControl
                                                placeholder="Password"
                                                type="password"
                                                inputRef={(password) => this.password = password}

                                            />
                                        </FormGroup>
                                    </div>
                                }
                                legend={
                              
                                              <Button type="submit" bsStyle="info" fill wd >
                                        Login
                                    </Button>
                                }
                                ftTextCenter
                            />
                            <Card
                                hidden={this.state.cardHidden2}
                                textCenter
                                content={<div className="text-center"><b>{this.state.cardTitle}</b></div>}
                            />
                        </form>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export default LoginPage;
