import React from 'react';
import 'html-to-react';
import { useParams } from 'react-router';

export function TextsAltViewer(props) {
    const view_type = props.viewtype;

    const params = useParams();
    let id = params.id; // When ID param is just a number
    if (id.indexOf('-') > 1) {
        // When ID param is something like "texts-1234".
        id = id.split('-').pop();
    }

    const env_base = getCurrentEnvBase();
    let iframe_url = '',
        back_href = '',
        close_title = 'Back to Text';
    if (view_type === 'voyant') {
        const ajax_text_path = env_base + '/shanti_texts/node_ajax_text/' + id;
        iframe_url =
            'http://voyant-tools.org/tool/Cirrus/?input=' + ajax_text_path;
    } else {
        back_href = window.location.href.replace('book_pubreader/', '');
        iframe_url = env_base + 'book_pubreader/' + id;
    }
    return (
        <>
            <div className={'close-iframe'}>
                <a href={back_href} title={close_title}>
                    <span className={'icon shanticon-cancel'}></span>
                </a>
            </div>
            <iframe src={iframe_url} className={'full-page-frame'} />
        </>
    );
}

function getCurrentEnvBase() {
    const host = window.location.host;
    if (host.indexOf('localhost') > -1 || host.indexOf('.github.io') > -1) {
        return 'https://texts-dev.shanti.virginia.edu/';
    } else {
        return 'https://texts.shanti.virginia.edu/';
    }
}
