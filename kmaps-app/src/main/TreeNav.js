import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
const PlacesTree = React.lazy(() => import('./PlacesTree'));
const TermsTree = React.lazy(() => import('./TermsTree'));
const SubjectsTree = React.lazy(() => import('./SubjectsTree'));

const TreeNav = (props) => {
    const openclass = props.tree ? 'open' : 'closed';

    return (
        <aside
            id="l-column__search--treeNav"
            className={`l-column__search c-TreeNav--tabs ${openclass} overflow-auto`}
        >
            <div>
                <span
                    className={
                        'sacrifical-dummy-element-that-is-not-displayed-for-some-reason'
                    }
                ></span>
                <Tabs defaultActiveKey="places" id="kmaps-tab">
                    <Tab eventKey="places" title="Places">
                        <PlacesTree currentFeatureId={props.currentFeatureId} />
                    </Tab>
                    <Tab eventKey="subjects" title="Subjects">
                        <SubjectsTree
                            currentFeatureId={props.currentFeatureId}
                        />
                    </Tab>
                    <Tab eventKey="terms" title="Terms">
                        <TermsTree currentFeatureId={props.currentFeatureId} />
                    </Tab>
                </Tabs>
            </div>
        </aside>
    );
};

export default TreeNav;
