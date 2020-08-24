// HISTORY!
import { useHistory } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { useStoreActions } from '../../model/StoreModel';
import useAsset from '../../hooks/useAsset';
import { useLocation, useRouteMatch } from 'react-router';

export default function HistoryListener() {
    const history = useHistory();
    const historyStack = useStoreState((state) => state.history.historyStack);
    const { addLocation, clear } = useStoreActions(
        (actions) => actions.history
    );
    const HISTORY_LENGTH = 25;
    const location = useLocation();
    const match = useRouteMatch([
        '/:type/:id/related-:relType/view/:relId',
        '/:type/:id',
        '/search',
    ]);
    // console.log('HISTORY VIEWER current = ', location);
    // console.log('HISTORY VIEWER match = ', match);

    const relatedType = match?.params?.relType;
    const relatedId = match?.params?.relId;

    function fixId(theId) {
        if (!theId) {
            return null;
        }
        const [fixedId] = theId.match(/(\d+)$/) || [];
        return fixedId;
    }

    const fixedId = fixId(match?.params.id);
    const kmasset = useAsset(match?.params.type, fixedId);

    const fixedRelId = fixId(relatedId);
    const relAsset = useAsset(relatedType, fixedRelId);

    // console.log(' HISTORY kmasset from kmapid = (', fixedId, ') is ', kmasset);
    // console.log(
    //     ' HISTORY related relatedType: ',
    //     relatedType,
    //     ' related id: ',
    //     relatedId
    // );
    // console.log(' HISTORY related asset: ', relAsset);

    function fixTitle(docs) {
        let title = null;
        if (docs?.length) {
            title = docs[0].title;
            if (!title) {
                title = docs[0].caption;
            }
        }
        if (!title) {
            title = null;
        }

        // console.log("grokked title = ", title, " from ", { title: docs[0].title, caption: docs[0].caption });
        return title;
    }

    useEffect(() => {
        if (kmasset) {
            if (kmasset.numFound > 0) {
                // console.log('HISTORY VIEWER: kmasset = ', kmasset);

                // Clean up title and related
                const title = fixTitle(kmasset.docs);
                const relLabel = fixTitle(relAsset.docs);

                const relTitle = relatedType ? (
                    <span
                        className={
                            'c-HistoryViewer__title c-HistoryViewer__relatedTitle'
                        }
                    >
                        <span
                            className={`icon shanticon-${relatedType}`}
                        ></span>{' '}
                        {relLabel}
                    </span>
                ) : null;

                // Create base location
                const baseLocation = {
                    ...location,
                    name: title,
                    relTitle: relTitle,
                    pathname: match.url,
                    asset_type: kmasset?.docs[0].asset_type,
                    kmasset: kmasset?.docs[0],
                };

                // console.log(
                //     'Making history: location = ',
                //     location,
                //     ' kmasset = ',
                //     kmasset,
                //     ' match.url = ',
                //     match.url
                // );
                addLocation(baseLocation);
            }
        }
    }, [kmasset, relAsset]);

    useEffect(() => {
        return history.listen((location) => {
            // console.log('History: Location = ', location);
        });
    }, [history]);

    return null;
}