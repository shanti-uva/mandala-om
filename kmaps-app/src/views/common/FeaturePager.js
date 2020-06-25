import InputNumber from "rc-input-number";
import * as PropTypes from "prop-types";
import React, {useState, useRef} from "react";
import NumericInput from 'react-numeric-input';


export function FeaturePager(props) {

    const [ pg, setPg ] = useState(0);
    const pageInput = useRef(null);

    let wingo = <NumericInput
        aria-label="Goto page"
        min={1}
        max={props.pager.getMaxPage() + 1}
        size={5}
        value={props.pager.getPage() + 1}
        onChange={(pg) => {
            console.log("FeaturePager pg = " + pg + " maxPage = " + props.pager.getMaxPage());
            props.pager.setPage(pg - 1);
        }}
        mobile={false}
        noStyle={true}
        ref={pageInput}
    />


    function firstPage() {
        props.pager.firstPage();
        console.log("firstPage()", pageInput.current);
        console.log("getPage()", props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage()+1);
    }

    function nextPage() {
        props.pager.nextPage();
        console.log("getPage()", props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage()+1);
    }

    function prevPage() {
        props.pager.prevPage();
        console.log("getPage()", props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage()+1);
    }

    function lastPage() {
        props.pager.lastPage();
        console.log("getPage()", props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage()+1);
    }

    return <div>
        <span onClick={firstPage} className={"shanticon-arrow-end-left icon"}> </span>
        <span onClick={prevPage} className={"shanticon-arrow3-left icon"}> </span>
        <span>{wingo}</span> of <span>{ props.pager.getMaxPage() + 1 }</span>
        &nbsp;
        <span onClick={nextPage} className={"shanticon-arrow3-right icon"}> </span>
        <span onClick={lastPage} className={"shanticon-arrow-end-right icon"}> </span>

        {props.loadingState ? <span> loading...</span> : <span></span>}

        <span className={"float-right"}>
            <span>items per page:</span>
            <NumericInput
                aria-label="Set number of items per page"
                min={1}
                max={100}
                size={3}
                // style={{width: "4em"}}
                value={props.pager.getPageSize()}
                onChange={(ps) => {
                    props.pager.setPageSize(ps);
                }}
                mobile={false}
                style={
                    {
                        "input.mobile": {
                            border: "0px"
                        },
                        "btnUp.mobile": {
                        }
                    }
                }
            />
        </span>

    </div>;
}

FeaturePager.propTypes = {
    pager: PropTypes.shape({
        getPageSize: PropTypes.func,
        getMaxPage: PropTypes.func,
        getPage: PropTypes.func,
        setPageSize: PropTypes.func,
        setPage: PropTypes.func
    }),
};