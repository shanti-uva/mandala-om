import React, { useState } from 'react';
import { BasicSearch } from './BasicSearch';
import { AdvancedToggle } from '../main/MainSearchToggle/AdvancedToggle';
import { MainNavToggle } from '../main/MainNavToggle/MainNavToggle';
import SearchContext from '../context/SearchContext';

export function SearchBar(props) {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('off');

    function chooseViewMode(mode) {
        console.log('chooseViewMode = ', mode);
        setViewMode(mode);
        if (mode === 'off') {
            props.onStateChange({ advanced: false, tree: false });
        } else if (mode === 'tree') {
            props.onStateChange({ advanced: false, tree: true });
        } else if (mode === 'advanced') {
            props.onStateChange({ advanced: true, tree: false });
        }
    }

    function handleInputChange(event) {
        console.log('Input Change', event.target.value);
        setSearch(event.target.value);
    }

    function handleSubmit(value) {
        console.log('Submit: ' + value);
        setSearch(value);
    }

    function handleClearBasic(event) {
        console.log('Clear');
        event.preventDefault();
    }

    const searchbar = (
        <section id="c-siteHeader__search" className="c-siteHeader__search">
            {/*<form onSubmit={this.handleSubmit}>*/}
            <SearchContext>
                <BasicSearch
                    onSubmit={handleSubmit}
                    onChange={handleInputChange}
                />
                <AdvancedToggle
                    chooseViewMode={chooseViewMode}
                    viewMode={viewMode}
                />
            </SearchContext>
            {/*</form>*/}
        </section>
    );
    return searchbar;
}
