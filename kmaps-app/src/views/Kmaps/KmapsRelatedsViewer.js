import React, { useState, useEffect } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import $ from 'jquery';
import './subjectsinfo.scss';
import { MandalaPopover } from '../common/MandalaPopover';

export function KmapsRelatedsViewer(props) {
    const [key, setKey] = useState('context');

    const { kmap, kmasset } = props;

    const kmaphead = kmap.header;
    const domain = kmap.tree;
    const kmtype = domain[0].toUpperCase() + domain.substr(1);
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;
    const base_path = window.location.pathname.split(domain)[0] + domain;

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

    const ispartof = [];
    const hasaspart = [];
    $.each(kmap?._childDocuments_, function (cdn, cd) {
        const relsub = cd?.related_uid_s?.split('-');
        if (!relsub || relsub.length !== 2) {
            return;
        }
        const relcode = cd?.related_subjects_relation_code_s;
        if (relcode === 'is.part.of') {
            ispartof.push(
                <MandalaPopover domain={relsub[0]} kid={relsub[1]} />
            );
        }
        if (relcode === 'has.as.a.part') {
            hasaspart.push(
                <MandalaPopover domain={relsub[0]} kid={relsub[1]} />
            );
        }
    });

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
                        featuresPath={base_path + '/%%ID%%/related-subjects'}
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
                    <h2>
                        {kmtype.toUpperCase()} RELATED TO{' '}
                        {kmaphead.toUpperCase()}
                    </h2>
                    Natural has {hasaspart.length + ispartof.length} other
                    subjects directly related to it, which is presented here.
                    See the {kmtype.toUpperCase()} CONTEXT tab if you instead
                    prefer to browse all subordinate and superordinate
                    categories for {kmaphead}.
                    {ispartof.length > 0 && (
                        <>
                            <h3>{kmaphead} Is a Part Of These Types</h3>
                            <ul>
                                {$.map(ispartof, function (pt, pn) {
                                    return <li>{pt}</li>;
                                })}
                            </ul>
                        </>
                    )}
                    {hasaspart.length > 0 && (
                        <>
                            <h3>{kmaphead} Has These Types</h3>
                            <ul>
                                {$.map(hasaspart, function (pt, pn) {
                                    return <li>{pt}</li>;
                                })}
                            </ul>
                        </>
                    )}
                </div>
            </Tab>
        </Tabs>
    );
}
