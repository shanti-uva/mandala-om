// HISTORY!
import { useHistory } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import { useStoreActions } from '../../model/StoreModel';
import useAsset from '../../hooks/useAsset';
import { useLocation, useRouteMatch } from 'react-router';
import * as qs from 'qs';

export default function HistoryListener() {
    // const history = useHistory();
    // const historyStack = useStoreState((state) => state.history.historyStack);
    // const searchState = useStoreState((state) => state.search);
    const { setSearchState } = useStoreActions((actions) => actions.search);
    const { addLocation, clear } = useStoreActions(
        (actions) => actions.history
    );
    const HISTORY_LENGTH = 25;
    const location = useLocation();
    const match = useRouteMatch([
        '/:type/:id/related-:relType/view/:relId',
        '/:type/:id',
        '/:type',
    ]);
    const searchMatch = useRouteMatch('/search/:mode');
    const relatedType = match?.params?.relType;
    const relatedId = match?.params?.relId;

    // console.log("Location: ", location);

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
        return title;
    }

    const qObj = qs.parse(location.search, {
        allowDots: true,
        ignoreQueryPrefix: true,
        depth: 5,
    });

    // console.log(
    //     'HISTORY LISTENER INIT location.search = ',
    //     location.search
    // );
    // console.log('HISTORY LISTENER INIT qs = ', qObj);

    let ss = {
        searchString: '',
        filters: [],
    };

    if (qObj.query?.searchText?.length) {
        ss.searchString = qObj.query.searchText;
    }
    if (qObj.query?.filters?.length) {
        ss.filters = qObj.query.filters;
    }
    if (qObj.page) {
        ss.page = {
            current: Number(qObj.page.current),
            rows: Number(qObj.page.rows),
        };
    }
    if (qObj.key) {
        ss.key = qObj.key;
    }

    // console.log('HISTORY LISTENER INIT setSearchState = ', ss);

    useEffect(() => {
        if (location.search?.length) {
            setSearchState(ss);
        }
    }, [location.search]);

    useEffect(() => {
        // console.log('HISTORY LISTENER useEffect(): 3');

        if (searchMatch && ss) {
            // console.log('HISTORY LISTENER useEffect(): 4');

            let filterNote = '';
            if (ss.filters?.length > 0) {
                const plural = ss.filters.length === 1 ? '' : 's';
                filterNote = ` (+${ss.filters.length} filter${plural})`;
            }

            const searchLocation = {
                ...location,
                name: '"' + ss.searchString + '"' + filterNote,
                pathname: match.url,
            };

            // console.log(
            //     'HISTORY LISTENER addLocation search = ',
            //     searchLocation
            // );

            if (ss.searchString !== '' || ss.filters?.length !== 0) {
                addLocation(searchLocation);
            }
        }
    }, [location.search]);

    const matchUrl = match?.url || '';
    const relDocs = relAsset?.docs || [];

    useEffect(() => {
        // console.log('HISTORY LISTENER useEffect(): 1', location.search);
        if (kmasset) {
            if (kmasset.numFound > 0) {
                // console.log('HISTORY LISTENER: kmasset = ', kmasset);

                // console.log('HISTORY LISTENER useEffect(): 2');

                // Clean up title and related
                const title = fixTitle(kmasset.docs);
                const relLabel = fixTitle(relAsset.docs);

                const relTitle = relatedType ? (
                    <span
                        className={
                            'c-HistoryViewer__title c-HistoryViewer__relatedTitle'
                        }
                    >
                        <span className={`icon u-icon__${relatedType}`}></span>{' '}
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
    }, [addLocation, kmasset, location, matchUrl, relDocs, relatedType]);

    // useEffect(() => {
    //     return history.listen((location) => {
    //         // console.log('History: Location = ', location);
    //     });
    // }, [history]);

    return null;
}
