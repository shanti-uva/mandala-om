import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SearchContext from '../context/SearchContext';
import { AdvancedToggle } from './MainSearchToggle/AdvancedToggle';
import { SearchAdvanced } from '../search/SearchAdvanced';
import { TreeNav } from './Main';

const target = document.getElementById('advancedSearchPortal');

export function RightSideBar(props) {
    const [viewMode, setViewMode] = useState('advanced');
    const [state, setState] = useState({});
    const handleStateChange = (new_state) => {
        setState({ ...state, ...new_state });
    };

    function chooseViewMode(mode) {
        setViewMode(mode);
        if (mode === 'off') {
            handleStateChange({ advanced: false, tree: false });
        } else if (mode === 'tree') {
            handleStateChange({ advanced: false, tree: true });
        } else if (mode === 'advanced') {
            handleStateChange({ advanced: true, tree: false });
        }
    }
    const advancedSearchPortal = (
        <>
            <section className="l-content__rightsidebar">
                <SearchContext>
                    <AdvancedToggle
                        chooseViewMode={chooseViewMode}
                        viewMode={viewMode}
                    />
                </SearchContext>
                <div className="advanced-search-and-tree">
                    <SearchContext>
                        <SearchAdvanced
                            advanced={state.advanced}
                            onStateChange={props.onStateChange}
                        />
                        <TreeNav tree={state.tree} />
                    </SearchContext>
                </div>
            </section>
        </>
    );

    if (target) {
        return ReactDOM.createPortal(advancedSearchPortal, target);
    } else {
        return advancedSearchPortal;
    }
}
