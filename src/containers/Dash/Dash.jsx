import React, { Component } from 'react';
import {
    Switch,
    Route,
    Redirect
} from 'react-router-dom';
// this is used to create scrollbars on windows devices like the ones from apple devices
import * as Ps from 'perfect-scrollbar';
import 'perfect-scrollbar/dist/css/perfect-scrollbar.min.css';
// react component that creates notifications (like some alerts with messages)
import NotificationSystem from 'react-notification-system';

import Sidebar from 'components/Sidebar/Sidebar.jsx';
import Header from 'components/Header/Header.jsx';
import Footer from 'components/Footer/Footer.jsx';

// dinamically create dashboard routes
import dashRoutes from 'routes/dash.jsx';
import * as jwt_decode from 'jwt-decode';

class Dash extends Component {
    constructor(props) {
        super(props);
        this.handleNotificationClick = this.handleNotificationClick.bind(this);
        this.state = {
            _notificationSystem: null
        };
    }

    loggedIn() {
        console.log("LocalStorage.token", localStorage.token);
        if (!localStorage.token) {
            return false;
        } else {
            let tokenDecoded = jwt_decode(localStorage.token);
            console.log("token.exp", tokenDecoded.exp);
            if (tokenDecoded.exp < new Date().getTime() / 1000) {
                return false;
            } else {
                if (tokenDecoded["https://lapr5.isep.pt/roles"].includes("supplier"))
                    return localStorage.token;
                else return false;
            }
        }
    }

    requireAuth() {
        if (!this.loggedIn()) {
            this.props.history.push('/pages/login-page');
            return false;
        } else { return true; }
    }

    componentDidMount() {
        this.setState({ _notificationSystem: this.refs.notificationSystem });
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            Ps.initialize(this.refs.mainPanel, { wheelSpeed: 2, suppressScrollX: true });
        }

    }
    // function that shows/hides notifications - it was put here, because the wrapper div has to be outside the main-panel class div
    handleNotificationClick(position) {
        var color = Math.floor((Math.random() * 4) + 1);
        var level;
        switch (color) {
            case 1:
                level = 'success';
                break;
            case 2:
                level = 'warning';
                break;
            case 3:
                level = 'error';
                break;
            case 4:
                level = 'info';
                break;
            default:
                break;
        }
        this.state._notificationSystem.addNotification({
            title: (<span data-notify="icon" className="pe-7s-gift"></span>),
            message: (
                <div>
                    Welcome to <b>Orders Front-End</b> - LAPR5.
                </div>
            ),
            level: level,
            position: position,
            autoDismiss: 15,
        });
    }
    // function that creates perfect scroll bar for windows users (it creates a scrollbar that looks like the one from apple devices)
    isMac() {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }
    componentDidUpdate(e) {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            setTimeout(() => { Ps.update(this.refs.mainPanel) }, 350);
        }
        if (e.history.action === "PUSH") {
            this.refs.mainPanel.scrollTop = 0;
        }
        //this.requireAuth();
    }
    componentWillMount() {
        if (document.documentElement.className.indexOf('nav-open') !== -1) {
            document.documentElement.classList.toggle('nav-open');
        }
        this.setState({ loggedIn: this.requireAuth() })
    }
    render() {
        return (
            <div className="wrapper">
                <NotificationSystem ref="notificationSystem" />
                <Sidebar {...this.props} />
                <div className={"main-panel" + (this.props.location.pathname === "/maps/full-screen-maps" ? " main-panel-maps" : "")} ref="mainPanel">
                    <Header {...this.props} />
                    <Switch>
                        {this.state.loggedIn ?
                            dashRoutes.map((prop, key) => {
                                if (prop.collapse) {
                                    return prop.views.map((prop, key) => {
                                        if (prop.name === "Notifications") {
                                            return (
                                                <Route
                                                    path={prop.path}
                                                    key={key}
                                                    render={routeProps =>
                                                        <prop.component
                                                            {...routeProps}
                                                            handleClick={this.handleNotificationClick}
                                                        />}
                                                />
                                            );
                                        } else {
                                            return (
                                                <Route path={prop.path} component={prop.component} key={key} />
                                            );
                                        }
                                    })
                                } else {
                                    if (prop.redirect)
                                        return (
                                            <Redirect from={prop.path} to={prop.pathTo} key={key} />
                                        );
                                    else
                                        return (
                                            <Route path={prop.path} component={prop.component} key={key} />
                                        );
                                }
                            }) : null
                        }
                    </Switch>
                    <Footer fluid />
                </div>
            </div>
        );
    }
}

export default Dash;
