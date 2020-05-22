import React, {useRef, useState} from "react";
import {useSelector} from "react-redux";
import {selectText} from "../features/kmsearch/kmsearchSlice";
import * as PropTypes from "prop-types";

export function BasicSearch(props) {
    const inputEl = useRef(null);
    const currText = useSelector(selectText);
    const [state, setState] = useState({searchString: {currText}});
    const clearInput = () => {
        inputEl.current.value = "";
    };
    const handleSubmit = () => {
        props.onSubmit(inputEl.current.value);
    }
    const handleChange = () => {
        // To be used for completions if desired
        // console.log("handleChange: ",inputEl.current.value);
    }
    const handleKey = (x) => {
        // submit on return
        if (x.keyCode === 13) {
            handleSubmit();
        }
    }
    return <>
        <div className='sui-search1'>
            <input type='text' id='sui-search' className='sui-search2'
                   defaultValue={currText}
                   placeholder='Enter Search'
                   onChange={handleChange}
                   onKeyDownCapture={handleKey}
                   ref={inputEl}/>
            <div id='sui-clear' className='sui-search3' onClick={clearInput}>&#xe610;</div>
        </div>
        <div id='sui-searchgo' className='sui-search4' onClick={handleSubmit}>&#xe623;</div>
    </>

}

BasicSearch.propTypes = {onChange: PropTypes.func};