import React from "react";
import {ADVANCED_LABEL, BASIC_LABEL} from "../App";

export class AdvancedToggle extends React.Component {

    constructor(props) {
        super(props);

        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.setAdvanced = this.setAdvanced.bind(this);
    }

    setAdvanced(adv) {
        // send state change message
        this.props.onStateChange({advanced: adv});
    }

    toggleAdvanced() {
        this.setAdvanced(!this.props.advanced);
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
    }

    componentDidCatch(error, errorInfo) {
    }

    render() {
        const label = (this.props.advanced) ? BASIC_LABEL : ADVANCED_LABEL;
        return (
            <div onClick={this.toggleAdvanced} id='sui-mode' className='sui-search5'
                 title='{label}'>{label}</div>
        )
    }
}