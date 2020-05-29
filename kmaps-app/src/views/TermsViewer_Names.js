import {buildNestedDocs} from "./common/utils";
import Card from "react-bootstrap/Card";
import React from "react";

export default function TermNames(props) {

    // console.log("calling buildNestedDocs");

    // TODO: Refactor so that Redux delivers the rebuilt nested docs instead of leaving it up to the Components.
    const namesTree = buildNestedDocs(props.kmapchild._childDocuments_, "related_names");

    let output = <Card>
        <Card.Body><Card.Title>Names</Card.Title>
            <ul className={"sui-nameEntry"}><NameEntry names={namesTree}/></ul>
        </Card.Body>
    </Card>
    return output;

}

/* NameEntry recursively draws the Name Tree
*   expects: props.names = tree built by buildNestedDocs()
*
* Perhaps this should parameterized...?
*
*/
export function NameEntry(props) {
    let outlist = [];

    Object.entries(props.names).map(([id, entry]) => {
        outlist.push(
            <li className={"sui-nameEntry"}>
                <span className={"sui-nameEntry-header"}>{entry.related_names_header_s}</span>
                <span className={"sui-nameEntry-meta"}>
                            <span className={"sui-nameEntry-language"}>{entry.related_names_language_s}</span>
                            <span className={"sui-nameEntry-relationship"}>{entry.related_names_relationship_s}</span>
                            <span
                                className={"sui-nameEntry-writing-system"}>{entry.related_names_writing_system_s}</span>
                        </span>
                <ul>
                    <NameEntry names={entry._nested_}/>
                </ul>
            </li>
        );
        return true;
    });
    const output = <React.Fragment>{outlist}</React.Fragment>
    return output;
}
