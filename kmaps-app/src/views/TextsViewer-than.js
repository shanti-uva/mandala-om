import React, { useState, useEffect } from 'react';
import { useParams } from "react-router";
import axios from 'axios';

export function TextsViewer(props) {
    const params = useParams();
    const tid = params.id;
    const tnum = tid.split('-').pop();
    const tembedpath = 'https://texts-stage.shanti.virginia.edu/shanti_texts/node_embed/' + tnum;
    const [txthtml, setData] = useState({ data: '' });
    useEffect(() => {
        const fetchData = async () => {
            const result = await axios( tembedpath );
            setData(result);
        };
        fetchData();
    }, []);
    console.log(txthtml);

    function createMarkup(customhtml) {
        return {__html: customhtml };
    }

    return (
        <div dangerouslySetInnerHTML={createMarkup(txthtml.data)} />
    );
}