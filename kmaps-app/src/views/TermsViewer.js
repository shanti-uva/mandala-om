import React from 'react';
import {Link} from 'react-router-dom';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import {Parser} from "html-to-react";
import $ from "jquery";

export class TermsViewer extends React.Component {

    constructor(props) {
        super(props);
        if (typeof props.sui !== 'object') {
            throw new Error("sui must be passed as a property to the component!");
        }

        if (typeof props.sui.pages !== 'object') {
            throw new Error("sui.pages must be passed as part of the sui passed to the constructor!");
        }
        this.sui = props.sui;
        this.props = props;

        // Todo: refactor this call
        this.sui.GetKmapFromID(this.props.id, (kmap) => {
            console.dir(kmap);
            if (!this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state = {kmap: kmap};
                // this.sui.pages.Draw(this.state.kmap, true);
                this.sui.GetChildDataFromID(this.props.id, (kmapchild) => {
                    if (!this.state || !this.state.kmapchild || kmapchild.uid && kmapchild.uid !== this.state.kmapchild.uid) {
                        this.state = {kmap:kmap, kmapchild: kmapchild};
                        // this.sui.pages.Draw(this.state.kmap, true);
                        this.props.onStateChange(this.state);
                    }
                })
            }
        });
    }

    static getDerivedStateFromProps(props,state) {
        console.log("TermsViewer.getDerivedStateFromProps()", arguments);
        return state;
    }

    componentDidMount() {
        console.log("TermsViewer:componentDidMount");
    }

    render() {
        console.error("TermsViewer render", this.props);
        const ERROR = <div className={'termsviewer'}>
            <div class={"sui-terms"}>
                <div>ERRORINESS</div>
                <div id={'sui-terms'}>id must be a term uid. Try this instead: <Link
                    to={"/view/assets/" + this.props.id}>/view/assets/{this.props.id}</Link></div>
                <div>PLAGNY</div>
            </div>
        </div>;

        const noout = <div className={'termsviewer'}>
            Yawn...
        </div>

        let output = noout;

        if (this.props.kmap && this.props.kmap.asset_type) {
            console.log("kmappungley: ", this.props.kmap);
            console.log("suiwhuiblui: ", this.sui.assets);

            output =
                <div className={'termsviewer'}>
                    <div className={"sui-terms"}>
                        <span className="shanticon-terms"></span>
                        &nbsp;&nbsp;&nbsp;
                        <span className="sui-termTitle"
                              id="sui-termTitle">{this.props.kmap.name_tibt}&nbsp;&nbsp;&nbsp;{this.props.kmap.name_latin[0]}</span>
                        <hr style={{"borderTop": '1px solid rgb(162, 115, 63)'}}/>

                        <TermNames kmap={ this.props.kmap }/>
                        <TermAudioPlayer kmapchild={ this.props.kmapchild } />

                    </div>
                </div>;
        }


        if (!this.props.id.match(/^terms-\d+/)) {
            return ERROR;
        } else {
            return output;
        }

        function TermNames(props) {
            return <div>BOAR: {props.kmap.names_txt}</div>
        }

        function TermAudioPlayer(props) {
            return <div>ROAR: {props.kmapchild}</div>
        }

    }


}