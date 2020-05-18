import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import { Parser } from 'html-to-react';
import $ from 'jquery';

export class AudioVideoViewer extends React.Component {

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

    componentDidMount() {


    }

    componentDidCatch(error, errorInfo) {
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
    }

    render() {
        const parser = new Parser();

        console.log("SKEEEP");
        console.dir(this.sui.pages.div.html());
        const output = parser.parse($(this.sui.pages.div).html());
        return <div> POPOP{ output }</div>;
    }



}