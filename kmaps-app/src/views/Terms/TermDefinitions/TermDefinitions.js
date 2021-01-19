import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ReactHtmlParser from 'react-html-parser';
import _ from 'lodash';
import { IconContext } from 'react-icons';
import { TiArrowUnsorted } from 'react-icons/ti';
import TermDefinitionsDetails from './TermDefinitionsDetails';
import TermDefinitionsPassages from './TermDefinitionsPassages';
import TermDefinitionsResources from './TermDefinitionsResources';
import './TermDefinitions.css';

//Function to aggregate TermDetails data
const aggregateDetails = _.memoize((def) => {
    return _.reduce(
        def,
        (accum, value, key) => {
            const matches = key.match(
                /^related_definitions_branch_subjects-(\d+)_(\w+)/
            );
            if (matches?.length > 0) {
                accum[matches[1]] = accum[matches[1]] || {};
                switch (matches[2]) {
                    case 'header_s':
                        accum[matches[1]]['header_title'] = value;
                        break;
                    case 'subjects_headers_t':
                        accum[matches[1]]['header_text'] = value;
                        break;
                    case 'subjects_uids_t':
                        accum[matches[1]]['header_uids'] = value;
                        break;
                    default:
                        break;
                }
            }
            return accum;
        },
        {}
    );
});

const TermDefinitions = (props) => {
    //Get Resources keyed by definition-id

    const relatedDocs = props.kmRelated.assets?.all?.docs || [];
    const uid = props.kmRelated.uid;
    const re = new RegExp(`${uid}_definitions-\\d+`);
    const resourceCounts = {};
    for (const doc of relatedDocs) {
        for (const kmapid of doc.kmapid) {
            if (re.test(kmapid)) {
                resourceCounts[kmapid] = resourceCounts[kmapid] ?? {};
                resourceCounts[kmapid][doc.asset_type] =
                    resourceCounts[kmapid][doc.asset_type] + 1 || 1;
                resourceCounts[kmapid]['all'] =
                    resourceCounts[kmapid]['all'] + 1 || 1;
            }
        }
    }

    return (
        <div className="sui-termDefinitions_wrapper">
            <div className="sui-termDefinitions__content">
                {_.orderBy(props.mainDefs, (val) => val.order, 'asc').map(
                    (def, order) => {
                        const defid = 'def-' + def.id.split('-').pop(); // simplified def.id
                        const defclass =
                            defid == window.location.hash.substr(1)
                                ? 'selected'
                                : false;
                        return (
                            <div
                                id={defid}
                                className={`definition ${defclass}`}
                            >
                                <Tabs
                                    key={def.id}
                                    defaultActiveKey="definition"
                                >
                                    <Tab
                                        eventKey="definition"
                                        title={
                                            <>
                                                <span className="sui-termDefinitions__tabHeading">
                                                    {`${
                                                        parseInt(order, 10) + 1
                                                    }. `}
                                                    Definition{' '}
                                                </span>
                                                <IconContext.Provider
                                                    value={{
                                                        style: {
                                                            verticalAlign:
                                                                'middle',
                                                        },
                                                    }}
                                                >
                                                    <TiArrowUnsorted />
                                                </IconContext.Provider>
                                            </>
                                        }
                                    >
                                        {ReactHtmlParser(
                                            def.related_definitions_content_s
                                        )}
                                        {def.related_definitions_author_s &&
                                            def.related_definitions_language_s && (
                                                <div className="sui-termDefinitions__extra">
                                                    <span className="sui-termDefinitions__extra-author">
                                                        Author:
                                                    </span>{' '}
                                                    <span className="sui-termDefinitions__extra-author-text">
                                                        {
                                                            def.related_definitions_author_s
                                                        }
                                                    </span>{' '}
                                                    |{' '}
                                                    <span className="sui-termDefinitions__extra-lang">
                                                        Language:
                                                    </span>{' '}
                                                    <span className="sui-termDefinitions__extra-lang-text">
                                                        {
                                                            def.related_definitions_language_s
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                    </Tab>
                                    {!_.isEmpty(aggregateDetails(def)) && (
                                        <Tab
                                            eventKey="details"
                                            title={
                                                <>
                                                    <span className="sui-termDefinitions__tabHeading">
                                                        Details{' '}
                                                    </span>
                                                    <IconContext.Provider
                                                        value={{
                                                            style: {
                                                                verticalAlign:
                                                                    'middle',
                                                            },
                                                        }}
                                                    >
                                                        <TiArrowUnsorted />
                                                    </IconContext.Provider>
                                                </>
                                            }
                                            disabled={_.isEmpty(
                                                aggregateDetails(def)
                                            )}
                                        >
                                            <TermDefinitionsDetails
                                                details={aggregateDetails(def)}
                                            />
                                        </Tab>
                                    )}
                                    {false && (
                                        <Tab
                                            eventKey="passages"
                                            title={
                                                <>
                                                    <span className="sui-termDefinitions__tabHeading">
                                                        Passages (0){' '}
                                                    </span>
                                                    <IconContext.Provider
                                                        value={{
                                                            style: {
                                                                verticalAlign:
                                                                    'middle',
                                                            },
                                                        }}
                                                    >
                                                        <TiArrowUnsorted />
                                                    </IconContext.Provider>
                                                </>
                                            }
                                            disabled
                                        >
                                            <TermDefinitionsPassages />
                                        </Tab>
                                    )}
                                    {parseInt(
                                        resourceCounts[def.id]?.all || 0
                                    ) > 0 && (
                                        <Tab
                                            eventKey="resources"
                                            title={
                                                <>
                                                    <span className="sui-termDefinitions__tabHeading">
                                                        Resources (
                                                        {resourceCounts[def.id]
                                                            ?.all || 0}
                                                        ){' '}
                                                    </span>
                                                    <IconContext.Provider
                                                        value={{
                                                            style: {
                                                                verticalAlign:
                                                                    'middle',
                                                            },
                                                        }}
                                                    >
                                                        <TiArrowUnsorted />
                                                    </IconContext.Provider>
                                                </>
                                            }
                                            disabled={
                                                parseInt(
                                                    resourceCounts[def.id]
                                                        ?.all || 0
                                                ) < 1
                                            }
                                        >
                                            <TermDefinitionsResources
                                                defID={def.id}
                                                resCounts={resourceCounts}
                                            />
                                        </Tab>
                                    )}
                                </Tabs>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};

export default TermDefinitions;
