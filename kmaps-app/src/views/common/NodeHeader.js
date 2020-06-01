import * as PropTypes from "prop-types";
import React from "react";

function NodeHeader(props) {
    return <div className={"sui-nodeHeader"}>
        <span className="shanticon-terms"></span>
        &nbsp;&nbsp;&nbsp;
        <span className="sui-termTitle sui-nodeTitle"
              id="sui-termTitle"><span
            className={"sui-nodeTitle-item tibt"}>{props.kmasset.name_tibt[0]}</span>&nbsp;&nbsp;&nbsp;<span
            className={"sui-nodeTitle-item latin"}>{props.kmasset.name_latin[0]}</span></span>
        <hr style={{"borderTop": "1px solid rgb(162, 115, 63)"}}/>
    </div>;
}

NodeHeader.propTypes = {kmap: PropTypes.any};

export default NodeHeader;