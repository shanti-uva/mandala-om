import React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function FeatureFoldOutViewer(props) {
    const [uid, setUid] = useState();
    const imgUid = props.focus?.alt;

    useEffect(() => {});

    return (
        <>
            <center>
                {props.focus ? <img src={props.focus.original} /> : <></>}
            </center>
            <pre>focus = {JSON.stringify(props.focus, undefined, 2)}</pre>
        </>
    );
}

export function FeatureFoldOutPortal({
    children,
    portalRootId,
    focused,
    galleryRef,
}) {
    const mount = document.getElementById(portalRootId);
    // console.log('Looking for portalRootId: ', mount);
    const el = document.createElement('div');
    useEffect(() => {
        if (mount) {
            mount.appendChild(el);
        }
        return () => {
            if (mount) {
                console.log('mount = ', mount);
            }
        };
    }, [el, mount]);
    return createPortal(children, el);
}
