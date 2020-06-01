import React, { useState } from 'react';

/**
 *    Container which injects the kmap and kmasset data, before rendering the its children.
 *
 *    It injects the props:
 *
 *          kmap:  The current fully-populated KMAP data including full solr child data
 *          kmasset:  The current ASSET data
 *
 *          NB:  This will ONLY inject into top-level children.  It is fully expected for these top-level components to manage
 *          passing its props to its children as needed.
 *
 *
 * */

// Can this remain a function component?
function KmapContext(props) {

    const [ kmapId, setKmapId] = useState("");

    if (props.children)










    return <h2>No Children?</h2>

}





