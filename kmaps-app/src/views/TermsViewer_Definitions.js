import React, {useState} from "react";
import {buildNestedDocs} from "./utils";
import Tab from "react-bootstrap/Tab";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import Nav from "react-bootstrap/Nav";
import _ from 'lodash';
import {Parser} from "html-to-react";

function Definitions(props) {
    const definitionsTree = buildNestedDocs(props.kmapchild._childDocuments_, "related_definitions");
    console.log("Definition: nested doc = ", definitionsTree);
    let output = <Card>
        <Card.Body><Card.Title>Definitions</Card.Title>
            <ul className={"sui-definitionEntry"}><Definition definitions={definitionsTree}
                                                              kmapchild={props.kmapchild}/></ul>
        </Card.Body>
    </Card>
    return output;
}

function Definition(props) {
    let primaryList = [];
    let otherSort = {};
    let otherList = [];

    console.log("Definition: ", props);
    Object.entries(props.definitions).map(([id, entry]) => {

        const otherSource = entry.related_definitions_source_s;
        if (otherSource) {
            // push the Other Dictionaries Header
            if (_.isEmpty(otherList)) {
                otherList.push(<hr/>, <h5>Other Dictionaries</h5>);
            }

            // find or create the dictionary
            let otherDict = otherSort[otherSource];
            if (!otherDict) {
                otherDict = {name: otherSource, definitions: []}
                otherSort[otherSource] = otherDict;
            }

            // add the definition to the dictionary
            otherDict.definitions.push(entry.related_definitions_content_s)

        } else {
            // only recurse if the _nested_ attribute is populated
            let nested = "";
            if (!_.isEmpty(entry._nested_)) {
                nested = <ul>
                    <Definition definitions={entry._nested_} kmapchild={props.kmapchild}/>
                </ul>
            }
            ;

            primaryList.push(
                <li className={"sui-definitionEntry"}>
                    <DefinitionEntry data={entry} kmapchild={props.kmapchild} nested={nested}/>
                </li>
            )
        }
    });

    // assemble otherList from otherSort
    Object.entries(otherSort).map(([id, entry]) => {
        otherList.push(
            <li className={"sui-definitionEntry"}>
                <OtherDefinitionEntry data={entry} kmapchild={props.kmapchild}/>
            </li>
        )
    });


    const output = [<React.Fragment>{primaryList}</React.Fragment>, <React.Fragment>{otherList}</React.Fragment>]
    return output;
}


function DefinitionEntry(props) {

    // if (props.data.related_definitions_source_s) {
    //     headerContent = props.data.related_definitions_source_s;
    // }

    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState(false);

    const parser = new Parser();
    const definitionUnescaped = parser.parse(props.data.related_definitions_content_s);

    const definitionDetails = parseDetails(props.data);

    function parseDetails(d) {

        let junk = {};
        let details = [];

        Object.entries(d).map(([key, value]) => {
            if (key.startsWith('related_definitions_branch_subjects')) {
                const [match, uid, field] = key.match(/related_definitions_branch_(subjects-\d+)_(\S+)/);
                if (!junk[uid]) {
                    junk[uid] = {};
                }
                junk[uid][field] = value;
            }
        });

        Object.entries(junk).map(([uid, entry]) => {
            let subjects = [];
            for (let i = 0; i < entry.subjects_uids_t.length; i++) {
                const sub = {header: entry.subjects_headers_t[i], uid: entry.subjects_uids_t[i]}
                subjects.push(sub);
            }
            const deets = {header: entry.header_s, uid: uid, values: subjects};
            console.log("Deeting: ", deets);
            details.push(deets);
        });

        let detailsMarkup = [];
        _.forEach(details, e => {
            const valuesList = _.map(e.values, x => <a href={"#" + x.uid}>{x.header}</a>)
            detailsMarkup.push(<li><span><a href={"#" + e.uid}>{e.header}</a></span>: <span>{valuesList}</span></li>);
        });

        return <div>
            <h6>Details</h6>
            {detailsMarkup}
            {/*<pre>{JSON.stringify(details, undefined, 3)}</pre>*/}
            {/*<pre>{JSON.stringify(junk, undefined,3)}</pre>*/}
        </div>


    }


    return <div>

        <Card>
            <Card onMouseEnter={() => {
                setOpen(true)
            }} onMouseLeave={() => {
                setOpen(false)
            }}>
                <Collapse in={open}>
                    <Card.Header>
                        <Nav variant="tabs" defaultActiveKey="definition">
                            <Nav.Item>
                                <Nav.Link eventKey={"definition"} onSelect={() => {
                                    setDetails(false)
                                }}>Definition</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey={"details"} onSelect={() => {
                                    setDetails(true)
                                }}>Other Info</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                </Collapse>

                <Card.Body>
                    {/*<Card.Title>Definition {props.data.order}</Card.Title>*/}
                    <Card.Text>
                        <dl>
                            <dt className={"sui-definitionEntry-term"}>{props.kmapchild.name_latin[0]}:</dt>
                            <dd>{definitionUnescaped}</dd>

                            <Collapse in={open}>
                                <ul className={"list-group list-group-horizontal-sm justify-content-end"}>
                                    <li className={"list-group-item border-0"}><span>Definition Language:</span>
                                        <span>{props.data.related_definitions_language_s}</span></li>
                                    <li className={"list-group-item border-0"}><span>Definition Author:</span>
                                        <span>{props.data.related_definitions_author_s}</span></li>
                                </ul>
                            </Collapse>


                            <Collapse in={details}>
                                <div>
                                    {definitionDetails}
                                    {/*<pre>{JSON.stringify(props.data, undefined, 3)}</pre>*/}
                                </div>
                            </Collapse>
                        </dl>
                    </Card.Text>

                    {props.nested}

                </Card.Body>
            </Card>
        </Card>

        {/*<Collapse in={!open}>*/}
        {/*    <Card>*/}
        {/*        <Card.Body>{props.kmapchild.name_latin[0]}: {definitionConverted}</Card.Body>*/}
        {/*    </Card>*/}
        {/*</Collapse>*/}
    </div>


    {/*</Card>*/
    }

    {/*<pre>{JSON.stringify(props.kmapchild, undefined, 3)}</pre>*/
    }
    {/*<pre>{JSON.stringify(props.data, undefined, 3)}</pre>*/
    }
}


function OtherDefinitionEntry(props) {

    const definitions = props.data.definitions.map((x) => {
        const parser = new Parser();
        const out = parser.parse(x);
        return <li className={"sui-definitionEntry-other"}>{out}</li>;
    });

    const entry = <>
        <Card>
            <Card.Header>
                {props.data.name}
            </Card.Header>
            <Card.Body>
                <div className={"sui-definitionEntry-term"}>{props.kmapchild.name_latin[0]}</div>
                <ol className={"sui-definitionEntry-other"}>
                    {definitions}
                </ol>
            </Card.Body>
        </Card>


        {/*<pre>{ JSON.stringify(props,undefined,3) }</pre>*/}
    </>


    return entry;
}

export default Definitions;