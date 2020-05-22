import React from 'react';

import SearchUI from "./legacy/searchui";
import Pages from "./legacy/pages";

import './Om.css';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import {CounterPage} from "./misc/CounterPage";
import {HeadSpace} from "./misc/HeadSpace";
import {Main} from "./main/Main";


export const ADVANCED_LABEL = "Advanced Search";
export const BASIC_LABEL = "Basic Search";

class App extends React.Component {

    constructor(props) {
        super();

        if (!window.sui) {
            window.sui = new SearchUI();
        }
        this.sui = window.sui;

        if (!window.sui.pages) {
            this.sui.pages = window.sui.pages = new Pages(this.sui);
        }

    }

    render() {
        return (
            <Router>
                {/*<div id={'router'}>*/}
                {/*    <ul>*/}
                {/*        <li><Link to={"/"}>Home</Link></li>*/}
                {/*        <li><Link to={"/counter"}>Counter</Link></li>*/}
                {/*        <li><Link to={"/headspace"}>Head Space</Link></li>*/}
                {/*    </ul>*/}
                {/*</div>*/}
                <Switch>
                    <Route path="/counter">
                        <CounterPage/>
                    </Route>
                    <Route path="/headspace">
                        <HeadSpace/>
                    </Route>
                    <Route path="/home">
                        <Main sui={this.sui}/>
                    </Route>
                    <Route path={"/view"}>
                        <Main sui={this.sui}/>
                    </Route>
                    <Route exact path="/">
                        <Redirect to={"/home"}/>
                    </Route>
                    <Route path="*">
                        <Error404/>
                    </Route>
                </Switch>
            </Router>
        );
    };
}

export function Error404() {
    return <div><h2>OUCH!</h2>
        Unknown Path: {window.location.pathname}
    </div>;
}

export default App;
