import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import {Parser} from "html-to-react";
import $ from "jquery";

export class LegacyViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.sui = props.sui;
        this.sui.GetKmapFromID(this.props.id, (kmap) => {
            console.dir(kmap);
            if ( !this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state={ kmap: kmap };
                this.sui.pages.Draw(this.state.kmap, true);
                this.props.onStateChange( this.state );
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        //TODO: TermsViewer shouldComponentUpdate() logic
        return false;
    }

    render() {
        const parser = new Parser();  // html-to-jsx parser
        const viewer = parser.parse($(this.sui.pages.div).html());
        const relateds = parser.parse($(this.sui.pages.reldiv).html())
        console.log("VIEWER = ", viewer);
        console.log("RELDIV = " + relateds);
        return <div className={"legacyviewer"} >{ viewer }</div>
    }
}