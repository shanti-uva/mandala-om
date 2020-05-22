import React from "react";
import {BrowserRouter as Router, Route} from "react-router-dom";

import {TopBar} from "./TopBar";
import {Home} from "./Home";
import {SearchLeft} from "./SearchLeft";
import {Hamburger} from "./Hamburger";

import {SearchBar} from "../search/SearchBar";
import {SearchAdvanced} from "../search/SearchAdvanced";

export class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            advanced: false,
            kmap: {
                header: "Mandala",
                title: ["Mandala"],
                uid: "mandala",
            },
            sui: this.props.sui
        };
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    render() {
        const main =
            <div id={'sui-main'} className={'sui-main'}>
                <div>
                    <TopBar/>
                    <SearchBar onStateChange={this.handleStateChange}/>
                    <Router>
                        <Route path={"/home"}>
                            <Home/>
                        </Route>
                        <Route path={"/view"}>
                            <SearchLeft site={'mandala'} mode={'development'} title={'Mandala'} sui={this.state.sui}
                                        kmap={this.state.kmap} kmapchild={this.state.kmapchild}
                                        onStateChange={this.handleStateChange}/>
                        </Route>
                    </Router>
                    <SearchAdvanced advanced={this.state.advanced}/>
                    <Hamburger hamburgerOpen={this.state.hamburgerOpen}/>
                </div>
            </div>
        return main;
    }

    handleStateChange(newstate) {
        console.log("Uber State Change requested: " + JSON.stringify(newstate));
        if (newstate.kmap && (newstate.kmap.id === this.state.kmap.id)) {
            return;
        }
        this.setState(newstate);
    }

    componentDidMount() {
        // this.props.fetchKmapData()
    }

}