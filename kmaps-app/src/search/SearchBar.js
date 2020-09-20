import React, { useState } from 'react';
import { BasicSearch } from './BasicSearch';
import { AdvancedToggle } from '../main/MainSearchToggle/AdvancedToggle';
import { MainNavToggle } from '../main/MainNavToggle/MainNavToggle';
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
        <section id="c-site__search" className="c-site__search">
            {/*<form onSubmit={this.handleSubmit}>*/}
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
            {/*</form>*/}
        </section>
    );
    return searchbar;
}
