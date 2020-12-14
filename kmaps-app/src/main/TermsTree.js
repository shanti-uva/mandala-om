import React from 'react';
const FancyTree = React.lazy(() => import('../views/FancyTree'));

const TermsTree = (props) => (
    <FancyTree
        domain="terms"
        tree="terms"
        descendants={true}
        directAncestors={false}
        displayPopup={true}
        perspective="tib.alpha"
        view="roman.scholar"
        sortBy="position_i+ASC"
        currentFeatureId={props.currentFeatureId}
    />
);

export default TermsTree;
