import React, { useState } from 'react';
import { BasicSearch } from './BasicSearch';
import { AdvancedToggle } from '../main/AdvancedToggle';
import { HamburgerToggle } from '../main/HamburgerToggle';
import SearchContext from '../context/SearchContext';

export function SearchBar(props) {
    const [search, setSearch] = useState('');

    function toggleAdvanced() {
        props.onStateChange({ advanced: !props.advanced });
    }

    function toggleHamburger() {
        props.onStateChange({ hamburgerOpen: !props.hamburgerOpen });
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
        <div id="sui-top" className="sui-top">
            {/*<form onSubmit={this.handleSubmit}>*/}
            <div style={{ display: 'inline-block' }}>
                <SearchContext>
                    <BasicSearch
                        onSubmit={handleSubmit}
                        onChange={handleInputChange}
                    />
                    <AdvancedToggle
                        onToggleAdvanced={toggleAdvanced}
                        advanced={props.advanced}
                    />
                </SearchContext>
            </div>
            {/*</form>*/}
        </div>
    );
    return searchbar;
}
