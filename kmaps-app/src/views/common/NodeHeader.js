import * as PropTypes from "prop-types";
import React from "react";

function NodeHeader(props) {
    const nameTibtElement = (props.kmasset.name_tibt)?props.kmasset.name_tibt[0]:props.kmasset.header;
    const nameLatinElement = (props.kmasset.name_latin)?props.kmasset.name_latin[0]:"";
    return <div className={"sui-nodeHeader"}>
        <span className="shanticon-terms"></span>
        &nbsp;&nbsp;&nbsp;
        <span className="sui-termTitle sui-nodeTitle"
              id="sui-termTitle"><span
            className={"sui-nodeTitle-item tibt"}>{nameTibtElement}</span>&nbsp;&nbsp;&nbsp;<span
            className={"sui-nodeTitle-item latin"}>{nameLatinElement}</span></span>
        <hr style={{"borderTop": "1px solid rgb(162, 115, 63)"}}/>
    </div>;
}

NodeHeader.propTypes = {kmap: PropTypes.any};

export default NodeHeader;