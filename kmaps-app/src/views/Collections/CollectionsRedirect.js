import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { useParams } from 'react-router';
import { Redirect } from 'react-router-dom';

export function CollectionsRedirect(props) {
    const params = useParams();
    const asset_type = params?.asset_type;
    const asset_id = params?.id;

    let vm = 'deck';
    if (asset_type === 'images') {
        vm = 'gallery';
    } else if (asset_type === 'sources' || asset_type === 'texts') {
        vm = 'list';
    }
    const redurl = `/${asset_type}/collection/${asset_id}/${vm}`;
    return <Redirect to={redurl} />;
}
