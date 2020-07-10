import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useStoreState } from 'easy-peasy';
import * as PropTypes from 'prop-types';
import _ from 'lodash';

export function BasicSearch(props) {
    const inputEl = useRef(null);
    const state = useStoreState((state) => state);
    const show_debug = false;
    if (show_debug) console.debug('BasicSearch: state = ', state);

    const currText = state.search.query?.searchText;
    // const [state, setState] = useState({searchString: {currText}});
    const handleSubmit = () => {
        props.search.setSearchText(inputEl.current.value);
        props.onSubmit(inputEl.current.value);
        console.log('BasicSearch handleSubmit: ', inputEl.current.value);
    };
    const clearInput = () => {
        inputEl.current.value = '';
        handleSubmit();
        props.onSubmit(inputEl.current.value);
        console.log('BasicSearch clearInput: ', inputEl.current.value);
    };
    const handleChange =
        // To be used for completions if desired
        _.debounce(() => {
            console.log('BasicSearch handleChange: ', inputEl.current.value);
        }, 500);

    const handleKey = (x) => {
        // submit on return
        if (x.keyCode === 13) {
            handleSubmit();
        }
    };

    useLayoutEffect(() => {
        // console.log("BasicSearch useEffect() props = ", props);
        // console.log("BasicSearch sees searchText = ", props.search.query.searchText);
        if (inputEl.current.value !== props.search.query.searchText) {
            inputEl.current.value = props.search.query.searchText;
        }
    });

    return (
        <>
            <div className="sui-search1">
                <input
                    type="text"
                    id="sui-search"
                    className="sui-search2"
                    defaultValue={currText}
                    placeholder="Enter Search"
                    onChange={handleChange}
                    onKeyDownCapture={handleKey}
                    ref={inputEl}
                />
                <div
                    id="sui-clear"
                    className="sui-search3"
                    onClick={clearInput}
                >
                    &#xe610;
                </div>
            </div>
            <div
                id="sui-searchgo"
                className="sui-search4"
                onClick={handleSubmit}
            >
                &#xe623;
            </div>
        </>
    );
}

BasicSearch.propTypes = { onChange: PropTypes.func };
