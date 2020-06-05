import React from 'react';

import SearchUI from "./legacy/searchui";
import Pages from "./legacy/pages";

import './Om.css';
import './shanticon.css';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import {CounterPage} from "./misc/CounterPage";
import {HeadSpace} from "./misc/HeadSpace";
import {Main} from "./main/Main";
import 'bootstrap/dist/css/bootstrap.min.css';

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
            <Main sui={this.sui}/>
        );
    };
}

export function Error404() {
    return <div><h2>OUCH!</h2>
        Unknown Path: {window.location.pathname}
    </div>;
}

export default App;
