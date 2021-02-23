import React from 'react';
import SearchUI from './legacy/searchui';
import Pages from './legacy/pages';

// import './Om.css';

// import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import { Main } from './main/Main';
import { NotFoundPage } from './views/common/utilcomponents';

export const ADVANCED_LABEL = 'Advanced';
export const BASIC_LABEL = 'Basic Search';

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
        // console.log(process.env);
        return <Main sui={this.sui} />;
    }
}

export function Error404() {
    return <NotFoundPage />;
}

export default App;
