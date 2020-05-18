import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import {Parser} from "html-to-react";
import $ from "jquery";
import html2react from "html-to-react-components";

export class TermsViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.sui = props.sui;
        this.sui.GetKmapFromID(this.props.id, (kmap) => {
            console.dir(kmap);
            if ( !this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state={ kmap: kmap };
                console.log("	TermsViewer: calling pages.Draw() with kmap=" + kmap.uid);
                this.sui.pages.Draw(this.state.kmap, true);
                this.props.onStateChange( this.state );
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log("TermsViewer: shouldComponentUpdate");
        console.dir(arguments);
        return false;
    }

    render() {
        const parser = new Parser();  // html-to-jsx parser
        const viewer = parser.parse($(this.sui.pages.div).html());
        const relateds = parser.parse($(this.sui.pages.reldiv).html())
        console.log("VIEWER = ", viewer);
        console.log("RELDIV = " + relateds);
        return <div className={"termsviewer"} >{ viewer }</div>
    }
}