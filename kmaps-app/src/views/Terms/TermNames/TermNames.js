import { buildNestedDocs } from '../../common/utils';
import React from 'react';
import _ from 'lodash';
import './NameEntry.css';

export default function TermNames(props) {
    // console.log("calling buildNestedDocs");

    // TODO: Refactor so that Redux delivers the rebuilt nested docs instead of leaving it up to the Components.
    const namesTree = buildNestedDocs(
        props.kmap?._childDocuments_,
        'related_names'
    );

    return (
        <div className="sui-nameEntry__wrapper">
            <ul className="sui-nameEntry first-entry">
                <NameEntry names={namesTree} />
            </ul>
        </div>
    );
}

/* NameEntry recursively draws the Name Tree
 *   expects: props.names = tree built by buildNestedDocs()
 *
 * Perhaps this should parameterized...?
 *
 */
export function NameEntry(props) {
    let outlist = [];

    // console.log('NameEntry: props.names=', props.names);
    Object.entries(props.names).map(([id, entry]) => {
        outlist.push(
            <li id={id} key={id} className="sui-nameEntry">
                <span className="sui-nameEntry-header">
                    {entry.related_names_header_s}
                </span>
                <span className="sui-nameEntry-meta">
                    <span className="sui-nameEntry-language">
                        {entry.related_names_language_s}
                    </span>
                    <span className="sui-nameEntry-relationship">
                        {entry.related_names_relationship_s}
                    </span>
                    <span className="sui-nameEntry-writing-system">
                        {entry.related_names_writing_system_s}
                    </span>
                </span>
                {!_.isEmpty(entry._nested_) && (
                    <ul>
                        <NameEntry names={entry._nested_} />
                    </ul>
                )}
            </li>
        );
        return true;
    });
    const output = <React.Fragment>{outlist}</React.Fragment>;
    return output;
}
