import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import {Parser} from "html-to-react";
import $ from "jquery";
import {withRouter} from "react-router-dom";

class LegacyViewer extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.sui = props.sui;

        const id = this.props.id || this.props.match.params.id;

        this.sui.GetKmapFromID(id, (kmap) => {
            console.log("LegacyViewer: kmap = ", kmap );
            if ( !this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state={ kmap: kmap, id:id };
                this.sui.pages.Draw(this.state.kmap, false);
                this.props.onStateChange( this.state );
                console.log("LegacyViewer: whoop")
            }
        });
    }

    render() {
        const parser = new Parser();  // html-to-jsx parser
        const viewer = parser.parse($(this.sui.pages.div).html());
        const relateds = parser.parse($(this.sui.pages.reldiv).html())
        console.log("LegacyViewer VIEWER = ", viewer);
        console.log("LegacyViewer RELDIV = " + relateds);
        return <div className={"legacyviewer"} >{ viewer }</div>
    }
}

export default withRouter(LegacyViewer);