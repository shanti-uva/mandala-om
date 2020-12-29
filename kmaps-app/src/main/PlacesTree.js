import React from 'react';
const FancyTree = React.lazy(() => import('../views/FancyTree'));

const PlacesTree = (props) => (
    <FancyTree
        domain="places"
        tree="places"
        descendants={true}
        directAncestors={false}
        displayPopup={true}
        perspective="pol.admin.hier"
        view="roman.scholar"
        sortBy="header_ssort+ASC"
        currentFeatureId={props.currentFeatureId}
    />
);

export default PlacesTree;
