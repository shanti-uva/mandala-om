import React from "react";
import {ContentHeader} from "./ContentHeader";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {AssetViewer} from "./ShowAsset";

export class SearchLeft extends React.Component {

    constructor(props) {
        super(props);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.state = {kmap: props.kmap};
    }

    handleStateChange(newstate) {
        // this.setState( newstate );
        console.log("SearchLeft.handleStateChange(): " + JSON.stringify(newstate));
        if (newstate.kmap && this.state.kmap && newstate.kmap.uid != this.state.kmap.uid) {
            console.log("newstate.kmap.uid = " + newstate.kmap.uid);
            console.log("state.kmap.uid = " + this.state.kmap.uid);
            this.setState(newstate, () => this.props.onStateChange(newstate));
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const next = nextProps.kmap.uid;
        const last = this.state.kmap.uid;

        console.log("next:" + next);
        console.log("last:" + last);

        return true;
    }

    render() {
        const title = this.props.title || "Untitled";
        const siteClass = this.props.site || "defauit";
        const left =
            <div id='sui-left' className='sui-left'>
                <ContentHeader siteClass={siteClass} title={title} sui={this.props.sui} kmap={this.props.kmap}/>
                {/*<Display siteClass={siteClass} />*/}
                <div id={"sui-results"}>
                    <Router>
                        <Switch>
                            <Route path="/view">
                                <AssetViewer sui={this.props.sui} kmap={this.props.kmap}
                                             kmapchild={this.props.kmapchild}
                                             onStateChange={this.handleStateChange}/>
                            </Route>
                        </Switch>
                    </Router>
                </div>
                {/*<div id={'sui-legacy'} className={'legacy sui-legacy'}></div>*/}
                {/*<div id={'sui-legacy-related'} className={'legacy sui-legacy-related'}></div>*/}
            </div>;
        return left;
    }
}