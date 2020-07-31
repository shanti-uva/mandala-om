import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

/**
 * A component to show external links in situ with a React-Bootstrap modal. The modal shows the content in an
 * IFrame and has a "Go" and "Done" button. "Go" opens the url in a new window. "Done" and the X in the upper
 * right corner closes the modal. The component takes the following properties/attributes:
 *    url: The url in question
 *    gourl: (optional) the url to link to if the "Go" If a site has a different url for embedding
 *           in an IFrame than when on it's own page. (For instance, YouTube uses "/embed/" in its path
 *           when videos are embedded, though that case is built into the code here)
 *     text: The content/text for the link to open the modal, e.g. "Watch my video!"
 *    title: (optional) text for an optional title attribute for the link
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function MandalaModal(props) {
    let myurl = props.url;
    let gotourl = props.gourl ? props.gourl : myurl;
    if (myurl.indexOf('youtube.com') > -1) {
        myurl = myurl.replace('watch?v=', 'embed/');
        if (myurl.indexOf('&t') > -1) {
            myurl = myurl.replace('&t', '?start');
            myurl = myurl.substring(0, myurl.length - 1);
        }
    }

    const mytext = props.text;
    const title = props.title ? props.title : 'External Link';

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <a
                className={'mandala-modal'}
                data-original-url={myurl}
                href={'#'}
                onClick={handleShow}
            >
                {mytext}
            </a>

            <Modal
                size={'xl'}
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>External Link: “{title}”</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe className={'mdlmodal'} src={myurl}></iframe>
                </Modal.Body>
                <Modal.Footer>
                    <a href={gotourl} target={'_blank'}>
                        <Button variant="success">Go</Button>
                    </a>
                    <Button variant="primary" onClick={handleClose}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
