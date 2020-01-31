import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import createHistory from 'history/createBrowserHistory' // This (and the WebRouter) might need to be extracted so React Native works?
import { operationFetch } from './utilities/AppFetch';

export class WebRouter {

    constructor() {
        const history = createHistory()
        this.history = history
    }

    currentLocation() {
        return window.location
    }

    currentPathname() {
        return window.location.pathname
    }

    changeURL(url) {
        //history.pushState({}, null, url)
        console.log("Changing Route", url)
        this.history.push(url, {})
    }

    parseRouteInfo(route) {
        var routeInfo = {
            fullPath: route,
            pathRoot: "",
            pathArgs: {}
        }
        const routeParts = route.split("/") // ["", "magic", "1", "2"]

        if (routeParts.length <= 1) {
            return routeInfo
        }

        routeInfo.pathRoot = routeParts[1]

        switch(routeInfo.pathRoot) {
            case "magic":
                routeInfo.pathArgs.userID = null
                if (routeParts.length >= 3) {
                    routeInfo.pathArgs.userID = parseInt(routeParts[2], 10)
                }

                routeInfo.pathArgs.linkToken = null
                if (routeParts.length >= 4) {
                    routeInfo.pathArgs.linkToken = parseInt(routeParts[3], 10)
                }
                break
            default:
                break
        }

        return routeInfo
    }


}

class Marine extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            currentRoute:"/login",
            defaultURL:"/home",
            redirectionUrl: null,
            signInURL:"/login",

            authToken: null,
            userID: null,
            accountID: null,

            signedInEmail: null,
            signedInAccountType: null,

            desktopMenuPersonal: false,

            mobileMenuMain: false,
            mobileMenuPersonal: false,
        }

        this.appComponent = props.mainAppComponent
        this.router = props.router
    }

    componentDidMount() {
        // Sign user in if creds are stashed
        this.attemptLogin()

        // Update route to match path in url bar
        this.initialRouteChange()

        // Close menus when clicking outside of them
        document.addEventListener('mousedown', (event) => {

            [
                "desktopMenuPersonal",
                "mobileMenuMain",
                "mobileMenuPersonal"
            ].forEach(menuState => {
                if (this.state[menuState] === true) {
                    let menuButton = document.getElementById(menuState + "-toggler")
                    console.log("menu button", menuButton)
                    if (menuButton.contains(event.target)) {
                        console.log("was menu button")
                        return
                    }

                    let menuElement = document.getElementById(menuState)
                    console.log("MENU OPEN", menuElement)
                    if (!menuElement.contains(event.target)) {
                        this.setState({
                            [menuState]: false,
                        })
                    }
                }
            })
        })
    }


    initialRouteChange() {
        this.setState({
            currentRoute: this.router.currentPathname(),
        })
    }


    isSignedIn() {
        if (this.state.authToken) {
            return true
        }
        return false
    }


    stashAuthenticationInfo(userID, accountID, authToken) {
        console.debug("stashing creds", userID, accountID, authToken)
        localStorage.userID = userID
        localStorage.accountID = accountID
        localStorage.authToken = authToken

    }


    clearAuthenticationInfo() {
        localStorage.removeItem("userID")
        localStorage.removeItem("accountID")
        localStorage.removeItem("authToken")

        this.setState({
            userID: null,
            accountID: null,
            authToken: null,
            signedInEmail: null,
            signedInAccountType: null,
        })

    }

    signUserOut() {
        this.clearAuthenticationInfo()
        this.changeRoute("/login")
    }

    signUserIn(userID, accountID, authToken) {
        console.log("Signing user in", userID, accountID, authToken)

        // Need to stash before API call
        this.stashAuthenticationInfo(userID, accountID, authToken)

        // Attempt Login
        return operationFetch({
            payload: {
                op: "sign_in_info",
                payload: {
                    person_id: userID,
                    account_id: accountID,
                }
            },
        })
        .then(data => {
            if (data.error_code !== null) {
                console.error("Something isn't right", data.error_code, data.error_message)
                return
            }

            let person = data.payload.entity_data.filter(x => x["_type"] === "person")[0]
            let account = data.payload.entity_data.filter(x => x["_type"] === "account")[0]

            this.setState({
                userID: person._id,
                accountID: account._id,
                authToken: authToken,
                signedInEmail: person.email,
                signedInAccountType: account.type,
            })

        }).catch(error => {
            console.error("Something isn't right", error)
        })

    }

    attemptLogin() {
        /*
        If user loads app and is already logged in then initilialize
        credentials.
         */

        if (localStorage.authToken !== undefined && localStorage.userID !== undefined && localStorage.accountID != undefined) {
            let userID = parseInt(localStorage.userID)
            let accountID = parseInt(localStorage.accountID)
            let authToken = localStorage.authToken
            this.signUserIn(userID, accountID, authToken)
        }
    }

    changeRoute(url) {
        this.router.changeURL(url)
        this.setState({
            currentRoute: url,
        })

        console.log("route now", this.state.currentRoute)
    }

    redirectionUrl() {
        return (this.state.redirectionUrl !== null ? this.state.redirectionUrl : this.state.defaultURL)
    }

    defaultURL() {
        return this.state.defaultURL
    }

    signInURL() {
        return this.state.signInURL
    }

    render() {

        return (
            <Provider marine={this}>
                <this.appComponent />
            </Provider>
        )
    }

}


class Provider extends Component {
    /*
    Makes use of React "Context" to pass the marine instance down to all
    components built with buildMarineComponent.  The Marine() instance will be
    available in this.marine for those components.

    A valid React "Context" provider requires getChildContext and
    childContextTypes to be implemented.
     */

    getChildContext() {
        return {
            marine: this.props.marine
        }
    }

    render() {
        return (
            <div>{this.props.children}</div>
        )
    }

}

Provider.childContextTypes = {
    marine: PropTypes.instanceOf(Marine)
    //marine: PropTypes.instanceOf.isRequired
}


export function buildMarineComponent(WrappedComponent) {
    /*
    Creates a component that receives the marine instance from the React Context.

    A valid React "Context" consumer requires contextTypes be implemented.
     */

    class MarineComponent extends WrappedComponent {

        constructor(props, context) {
            super(props, context)

            // Affix marine instance to component
            this.marine = context.marine
        }

        componentDidMount(props, context) {

            // If parent has componentDidMount, call it
            if (WrappedComponent.prototype.hasOwnProperty("componentDidMount")) {
                WrappedComponent.prototype.componentDidMount.call(this, props, context)
            }

        }

    }

    MarineComponent.contextTypes = {
        marine: PropTypes.instanceOf(Marine)
    }

    return MarineComponent;

};

export default Marine;

