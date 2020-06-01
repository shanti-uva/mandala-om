import {buildNestedDocs} from "./common/utils";
import React from "react";

function RelatedTerms(props) {
    const terms = buildNestedDocs(props.kmap._childDocuments_, "related_terms");
    return <div><h3>Related Terms</h3>
        <pre>{JSON.stringify(terms, undefined, 3)}</pre>
    </div>
}

export default RelatedTerms;
