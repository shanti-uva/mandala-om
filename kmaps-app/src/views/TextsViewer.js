import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';

export class TextsViewer extends React.Component {

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
        this.sui.GetKmapFromID(this.props.id, (kmap) => {
            console.dir(kmap);
            if (kmap.uid) {
                console.log("	PAGEROUTER: calling pages.Draw() with kmap=" + kmap.uid);
                this.sui.pages.Draw(kmap, true);
            } else {
                alert("kmap.uid was null");
            }
        });

        return <div className={"texts legacy"} >TEXTS LEGACY { JSON.stringify(this.props.sui.state) }</div>

    }


}