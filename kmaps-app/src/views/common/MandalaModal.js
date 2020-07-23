import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function MandalaModal(props) {
    const myurl = props.url;
    const gotourl = props.gourl;
    const mytext = props.text;
    const title = props.title ? props.title : 'External Link';

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <a className={'mandala-modal'} href={'#'} onClick={handleShow}>
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
