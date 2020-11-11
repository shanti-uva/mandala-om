import React, { useState, useEffect } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import $ from 'jquery';
import './subjectsinfo.scss';

export function KmapsRelatedsViewer(props) {
    const [key, setKey] = useState('context');

    const { kmap, kmasset } = props;

    const kmtype = 'Subjects';
    const kmaphead = kmap.header;
    const domain = kmap.tree;
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;

    const ancestor_count = kmap?.ancestors_gen?.length
        ? kmap.ancestors_gen.length - 1
        : 0;
    let child_count = 0;
    if (kmap?._childDocuments_?.length > 0) {
        const filtered_children = $.map(kmap._childDocuments_, function (
            child
        ) {
            if (child.block_child_type === 'related_subjects') {
                return child;
            } else {
                return null;
            }
        });
        child_count = filtered_children.length - 1; // seems to include self
    }

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    return (
        <Tabs
            id="kmaps-relateds-tabs"
            className={'kmaps-related-viewer'}
            activeKey={key}
            onSelect={(k) => setKey(k)}
        >
            <Tab eventKey="context" title={`${kmtype} Context`}>
                <div className={'kmap-context'}>
                    <h2>
                        {kmtype} related to {kmaphead}
                    </h2>
                    <p>
                        {kmaphead} has {ancestor_count} superordinate subjects
                        and {child_count} subordinate subjects. You can browse
                        these subordinate subjects as well as its superordinate
                        categories with the tree below. See the RELATED SUBJECTS
                        tab if you instead prefer to view only its immediately
                        subordinate subjects grouped together in useful ways, as
                        well as subjects non-hierarchically related to it.
                    </p>
                    <FancyTree
                        domain={domain}
                        tree={domain}
                        featuresId={kid}
                        featuresPath={'/mandala-om/' + domain + '/%%ID%%'}
                        descendants={true}
                        directAncestors={true}
                        displayPopup={false}
                        perspective={'gen'}
                        sortBy={'related_subjects_header_s+ASC'}
                    />
                    {/*
                        <pre>
                            {
                                JSON.stringify(kmap, null, 4)
                            }
                        </pre>
                    */}
                </div>
            </Tab>
            <Tab eventKey="related" title={`Related ${kmtype}`}>
                <div className={'kmap-related'}>
                    <h2>Related {kmtype}</h2>
                    <p>They would go here</p>
                </div>
            </Tab>
        </Tabs>
    );
}
