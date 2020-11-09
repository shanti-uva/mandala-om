import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useStoreState } from 'easy-peasy';
import * as PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, useHistory } from 'react-router';

const target = document.getElementById('basicSearchPortal');

export function BasicSearch(props) {
    const history = useHistory();
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
        if (process.env.REACT_APP_STANDALONE === 'standalone') {
            window.location.href = `${process.env.REACT_APP_STANDALONE_PATH}/#/search`;
        } else {
            history.push('/search');
        }
    };
    const clearInput = () => {
        inputEl.current.value = '';
        //handleSubmit();
        props.search.setSearchText(inputEl.current.value);
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
        if (inputEl.current.value !== props.search.query.searchText) {
            inputEl.current.value = props.search.query.searchText;
        }
    });

    const basicSearchPortal = (
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
                <span className={'l-search__input__buttons'}>
                    <span
                        id="sui-searchgo"
                        className="sui-search4"
                        onClick={handleSubmit}
                    >
                        <span className={'icon'}></span>
                    </span>
                    <span
                        id="sui-clear"
                        className="sui-search3"
                        onClick={clearInput}
                    >
                        {' '}
                        x{' '}
                    </span>
                </span>
            </div>
        </>
    );

    if (target) {
        return ReactDOM.createPortal(
            basicSearchPortal,
            document.getElementById('basicSearchPortal')
        );
    } else {
        return basicSearchPortal;
    }
}

BasicSearch.propTypes = { onChange: PropTypes.func };
