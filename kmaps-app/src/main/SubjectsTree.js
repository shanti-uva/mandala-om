import React from 'react';
const FancyTree = React.lazy(() => import('../views/FancyTree'));

const SubjectsTree = (props) => (
    <FancyTree
        domain="subjects"
        tree="subjects"
        descendants={true}
        directAncestors={false}
        displayPopup={true}
        perspective={'gen'}
        view="roman.popular"
        sortBy="header_ssort+ASC"
        currentFeatureId={props.currentFeatureId}
    />
);

export default SubjectsTree;
