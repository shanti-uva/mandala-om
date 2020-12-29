import React, { useState } from 'react';
import { buildNestedDocs } from '../common/utils';
// import Tab from "react-bootstrap/Tab";
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';
// import Fade from "react-bootstrap/Fade";
import Nav from 'react-bootstrap/Nav';
import _ from 'lodash';
import { Parser } from 'html-to-react';

function Definitions(props) {
    const definitionsTree = buildNestedDocs(
        props.kmap._childDocuments_,
        'related_definitions'
    );
    //console.log('Definition: nested doc = ', definitionsTree);
    let output = (
        <Card>
            <Card.Body>
                <Card.Title>Definitions</Card.Title>
                <ul className={'sui-definitionEntry'}>
                    <Definition
                        definitions={definitionsTree}
                        kmap={props.kmap}
                    />
                </ul>
            </Card.Body>
        </Card>
    );
    return output;
}

function Definition(props) {
    let primaryList = [];
    let otherSort = {};
    let otherList = [];

    // TODO: Review whether this collation of "Other Definitions" should be part of view logic or business logic.
    //  Right now, I'm thinking it should stay as view logic.

    Object.entries(props.definitions).map(([id, entry]) => {
        const otherSource = entry.related_definitions_source_s;
        if (otherSource) {
            // find or create the dictionary
            let otherDict = otherSort[otherSource];
            if (!otherDict) {
                otherDict = { name: otherSource, definitions: [] };
                otherSort[otherSource] = otherDict;
            }

            // add the definition to the dictionary
            otherDict.definitions.push(entry.related_definitions_content_s);
        } else {
            // only recurse if the _nested_ attribute is populated
            let nested = '';
            if (!_.isEmpty(entry._nested_)) {
                nested = (
                    <ul>
                        <Definition
                            definitions={entry._nested_}
                            kmap={props.kmap}
                        />
                    </ul>
                );
            }
            primaryList.push(
                <li key={entry.uid} className={'sui-definitionEntry'}>
                    <DefinitionEntry
                        data={entry}
                        kmap={props.kmap}
                        nested={nested}
                    />
                </li>
            );
        }
        return true;
    });

    // assemble otherList from otherSort
    Object.entries(otherSort).map(([id, entry]) => {
        otherList.push(
            <li key={entry.uid} className={'sui-definitionEntry'}>
                <OtherDefinitionEntry data={entry} kmap={props.kmap} />
            </li>
        );
        return true;
    });

    // Add the Primary Definitions to the output.
    let output = [<React.Fragment>{primaryList}</React.Fragment>];

    // Add an "Other Dictionaries" Header if there are other dictionaries.
    if (otherList.length) {
        output.push(
            <React.Fragment>
                <hr />
                <h5>Other Dictionaries</h5>
            </React.Fragment>,
            <React.Fragment>{otherList}</React.Fragment>
        );
    }

    return output;
}

function DefinitionEntry(props) {
    // if (props.data.related_definitions_source_s) {
    //     headerContent = props.data.related_definitions_source_s;
    // }

    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState(false);

    // TODO: NEED TO comb out naughty markup in the data. e.g. <p>'s need to be converted to <div>'s
    //  See htmlToReactParser.parseWithInstructions() at https://www.npmjs.com/package/html-to-react
    //  I think one could intercept those <p>'s (and any other offending markup) and rewrite them.

    const parser = new Parser();
    const definitionUnescaped = parser.parse(
        props.data.related_definitions_content_s
    );

    const definitionDetails = parseDetails(props.data);

    // TODO: need to refactor this logic out of the Component and into middleware/business logic.
    //  Just haven't decided where it should go yet.
    function parseDetails(d) {
        let branches = {};
        let details = [];

        // collect data by "branch"
        Object.entries(d).forEach(([key, value]) => {
            if (key.startsWith('related_definitions_branch_subjects')) {
                // eslint-disable-next-line
                const [match, uid, field] = key.match(
                    /related_definitions_branch_(subjects-\d+)_(\S+)/
                );
                if (!branches[uid]) {
                    branches[uid] = {};
                }
                branches[uid][field] = value;
            }
        });

        // reorganize by "branch" subject
        Object.entries(branches).forEach(([uid, entry]) => {
            let subjects = [];
            for (let i = 0; i < entry.subjects_uids_t.length; i++) {
                const sub = {
                    header: entry.subjects_headers_t[i],
                    uid: entry.subjects_uids_t[i],
                };
                subjects.push(sub);
            }
            const deets = {
                header: entry.header_s,
                uid: uid,
                values: subjects,
            };
            // console.log("Deeting: ", deets);
            details.push(deets);
        });

        // The markup code below should stay in the Viewer

        // render the markup list
        let detailsMarkup = [];
        _.forEach(details, (e, i) => {
            // TODO: refactor the href's into ...  <Link>'s?
            const valuesList = _.map(e.values, (x) => (
                <a href={'#' + x.uid}>{x.header}</a>
            ));
            detailsMarkup.push(
                <li key={i}>
                    <span>
                        <a href={'#' + e.uid}>{e.header}</a>
                    </span>
                    : <span>{valuesList}</span>
                </li>
            );
        });

        // render the div
        return (
            <div>
                <h6>Details</h6>
                {detailsMarkup}
            </div>
        );
    }

    // TODO: review whether this could/should be simplified to use <Tabs>/<Tab>/<TabPane> instead.
    // ys2n: I couldn't get the markup to look right when <Tabs>'s were nested in other Bootstrap components.
    // So I went with this more-complicated implementation.
    //
    // I also introduced mouseover/mouseleave mechanics, which I personally find more clear since it hides the
    // tabbed interface when casually browsing.  These mechanics need to be reviewed to handle the case where
    // sub-defintion are within the same div as the parent.  Currently the parent definition is expanded still
    // when you mouseover a sub-definition.  That maybe okay,  I'm just not sure.
    //
    return (
        <div>
            <Card>
                <Card
                    onMouseEnter={() => {
                        setOpen(true);
                    }}
                    onMouseLeave={() => {
                        setOpen(false);
                    }}
                >
                    <Collapse in={open}>
                        <Card.Header>
                            <Nav variant="tabs" defaultActiveKey="definition">
                                <Nav.Item>
                                    <Nav.Link
                                        eventKey={'definition'}
                                        onSelect={() => {
                                            setDetails(false);
                                        }}
                                    >
                                        Definition
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        eventKey={'details'}
                                        onSelect={() => {
                                            setDetails(true);
                                        }}
                                    >
                                        Other Info
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                    </Collapse>

                    <Card.Body>
                        <Card.Text>
                            <dl>
                                <dt className={'sui-definitionEntry-term'}>
                                    {props.kmap.name_latin[0]}:
                                </dt>
                                <dd>{definitionUnescaped}</dd>

                                <Collapse in={open}>
                                    <ul
                                        className={
                                            'list-group list-group-horizontal-sm justify-content-end'
                                        }
                                    >
                                        <li
                                            key="lang"
                                            className={
                                                'list-group-item border-0'
                                            }
                                        >
                                            <span>Definition Language:</span>
                                            <span>
                                                {
                                                    props.data
                                                        .related_definitions_language_s
                                                }
                                            </span>
                                        </li>
                                        <li
                                            key="author"
                                            className={
                                                'list-group-item border-0'
                                            }
                                        >
                                            <span>Definition Author:</span>
                                            <span>
                                                {
                                                    props.data
                                                        .related_definitions_author_s
                                                }
                                            </span>
                                        </li>
                                    </ul>
                                </Collapse>

                                <Collapse in={details}>
                                    <div>{definitionDetails}</div>
                                </Collapse>
                            </dl>
                        </Card.Text>

                        {props.nested}
                    </Card.Body>
                </Card>
            </Card>
        </div>
    );
}

function OtherDefinitionEntry(props) {
    const definitions = props.data.definitions.map((x, i) => {
        const parser = new Parser();
        const out = parser.parse(x);
        return (
            <li key={i} className={'sui-definitionEntry-other'}>
                {out}
            </li>
        );
    });

    const entry = (
        <>
            <Card>
                <Card.Header>{props.data.name}</Card.Header>
                <Card.Body>
                    <div className={'sui-definitionEntry-term'}>
                        {props.kmap.name_latin[0]}
                    </div>
                    <ol className={'sui-definitionEntry-other'}>
                        {definitions}
                    </ol>
                </Card.Body>
            </Card>

            {/*<pre>{ JSON.stringify(props,undefined,3) }</pre>*/}
        </>
    );

    return entry;
}

export default Definitions;
