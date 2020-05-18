import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import $ from 'jquery';

export class SubjectsViewer extends React.Component {

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

        if (typeof props.onStateChange !== 'function') {
            throw new Error("onStateChange must be passed");
        }
    }

    componentDidMount() {
        console.log("componentDidMount");
        this.sui.GetKmapFromID(this.props.id, (kmap) => {
            console.log("calling pages.Draw() with kmap=" + kmap.uid);
            this.props.onStateChange( { kmap: kmap });
            this.sui.pages.Draw(kmap, true);
        });
    }

    componentDidCatch(error, errorInfo) {

    }

    componentWillUnmount() {
        console.log("componentWillUnmount");
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.sui.GetKmapFromID(this.props.id, (kmap) => {
            console.log(" calling pages.Draw() with kmap=" + kmap.uid);
            this.props.onStateChange( { kmap: kmap });
            this.sui.pages.Draw(kmap, true);
        });
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log("shouldComponentUpdate");
        return true;
    }

    render() {
        return <div className={"Subjects legacy"} >SUBJECTS LEGACY { JSON.stringify(this.props.kmaps) }</div>
    }


}