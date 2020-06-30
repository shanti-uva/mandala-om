import React from 'react';
import { FeaturePager } from './FeaturePager';
import _ from 'lodash';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
// import Button from "react-bootstrap/Button";

export function FeatureList(props) {
    let LIST = _.map(props.docs, (doc) => {
        return (
            <Card className={'p-0 m-1'} key={doc.id}>
                <Accordion>
                    <Card.Body className={'p-1'}>
                        <span
                            className={'shanticon-' + doc.asset_type + ' icon'}
                        />{' '}
                        {doc.title} ({doc.uid})
                        <Accordion.Toggle
                            as={'span'}
                            eventKey="0"
                            onClick={(x) => {
                                if (x.target.innerHTML === '(+)') {
                                    x.target.innerHTML = '(-)';
                                } else {
                                    x.target.innerHTML = '(+)';
                                }
                            }}
                        >
                            (+)
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card>
                                <pre>{JSON.stringify(doc, undefined, 2)}</pre>
                            </Card>
                        </Accordion.Collapse>
                    </Card.Body>
                </Accordion>
                {/*<Card.Footer><pre>{ JSON.stringify(doc, undefined,2)}</pre></Card.Footer>*/}
            </Card>
        );
    });

    const output = (
        <div>
            <Container>
                <FeaturePager pager={props.pager} />
                {LIST}
                <FeaturePager pager={props.pager} />
            </Container>
        </div>
    );

    return (
        <div>
            {output}
            <pre>{JSON.stringify(props, undefined, 2)}</pre>
        </div>
    );
}
