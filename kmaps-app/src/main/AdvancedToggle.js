import React from 'react';
import { ADVANCED_LABEL, BASIC_LABEL } from '../App';

export function AdvancedToggle(props) {
    const label = props.advanced ? BASIC_LABEL : ADVANCED_LABEL;

    function toggleAdvanced() {
        props.onToggleAdvanced();
    }

    return (
        <div
            onClick={toggleAdvanced}
            id="sui-mode"
            className="sui-search5"
            title="{label}"
        >
            {label}
        </div>
    );
}
