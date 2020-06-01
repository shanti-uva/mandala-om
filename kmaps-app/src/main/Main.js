import React from "react";
import {BrowserRouter as Router, Route, Redirect, Switch} from "react-router-dom";

import {TopBar} from "./TopBar";
import {Home} from "./Home";
import {ContentPane} from "./ContentPane";
import {Hamburger} from "./Hamburger";

import {SearchBar} from "../search/SearchBar";
import {SearchAdvanced} from "../search/SearchAdvanced";
import {Error404} from "../App";

export class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            advanced: false,
            // Start with faked kmap
            kmasset: {
                header: "Mandala",
                title: ["Mandala"],
                uid: "mandala",
            },
            sui: this.props.sui  // the legacy sui SearchUI object
        };
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    render() {
        const main =
            <Router>
                <div id={'sui-main'} className={'sui-main'}>
                    <div>
                        <TopBar/>
                        <SearchBar onStateChange={this.handleStateChange}/>
                        <Switch>
                            <Route path={"/home"}>
                                <Home/>
                            </Route>
                            <Route exact path={"/"}>
                                <Redirect to={"/home"} />
                            </Route>
                            <Route path={"/view"}>
                                <ContentPane site={'mandala'} mode={'development'} title={'Mandala'}
                                             sui={this.state.sui}
                                             kmasset={this.state.kmasset}
                                             kmterm={this.state.kmterm}
                                             onStateChange={this.handleStateChange}/>
                            </Route>
                            <Route path={"*"}>
                                <Error404/>
                                <Home/>
                            </Route>
                        </Switch>
                        <SearchAdvanced advanced={this.state.advanced}/>
                        <Hamburger hamburgerOpen={this.state.hamburgerOpen}/>
                    </div>
                </div>
            </Router>

        return main;
    }

    handleStateChange(newstate) {
        console.log("Uber State Change requested: " + JSON.stringify(newstate));
        if (newstate.kmasset && (newstate.kmasset.id === this.state.kmasset.id)) {
            return;
        }
        this.setState(newstate);
    }

    componentDidMount() {
        // this.props.fetchKmapData()
    }

}