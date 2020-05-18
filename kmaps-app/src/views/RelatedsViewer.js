import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import {Parser} from "html-to-react";
import $ from "jquery";

export class RelatedsViewer extends React.Component {

    constructor(props) {
        super(props);

        console.error(typeof props.sui);
        if (typeof props.sui !== 'object') {
            throw new Error("sui must be passed as a property to the component!");
        }

        if (typeof props.sui.pages !== 'object') {
            throw new Error("sui.pages must be passed as part of the sui passed to the constructor!");
        }

        this.sui = props.sui;
        this.props = props;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return false;
    }

    render() {
        if (this.state && this.state.kmap) {
            this.props.onStateChange({ kmap: this.state.kmap });
        }

        const parser = new Parser();

        const relateds = parser.parse($(this.sui.pages.reldiv).html())


        console.log("relateds div parsed ", relateds);
        return <div className={"relatedsviewer"} >{ relateds }</div>
    }
}