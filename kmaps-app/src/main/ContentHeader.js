import React from "react";

export class ContentHeader extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        console.error("RECEIVED PROPS", props);
    }

    // static getDerivedStateFromProps(props,state) {
    //     console.log("ContentHeader: getDerivedStatefromProps()");
    //     console.log("ContentHeader: props", props);
    //     console.log("ContentHeader: state", state);
    //
    //     let newstate = state;
    //     if (props.sui.curResults && props.sui.curResults.length) {
    //         newstate = props.sui.curResults[0];
    //     }
    //     return newstate;
    // }

    render() {
        console.log("ContentHeader render() with " + JSON.stringify(this.props.kmap));
        const cheader =
            <div id='sui-header' className={`sui-header legacy ${this.props.siteClass}`}>
                <div id='sui-headLeft' className='sui-headLeft legacy'>
                    <div>
                        <span>{this.props.kmap.title}</span>
                        <span>({this.props.kmap.uid})</span>
                    </div>
                </div>
            </div>;
        return cheader;
    }
}