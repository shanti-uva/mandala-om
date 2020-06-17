import React, {useState} from 'react';
import {useParams} from "react-router";
import {getRelatedAssetsPromise, getAssetDataPromise, getFullKmapDataPromise} from "../logic/searchapi";
import _ from 'lodash';

/**
 *    Container which injects the kmap and kmasset data, before rendering the its children.
 *
 *    It injects the props:
 *
 *          kmap:  The current fully-populated KMAP data including full solr child data
 *          kmasset:  The current ASSET data
 *
 *          NB:  This will ONLY inject into top-level children.  It is fully expected for these top-level components to manage
 *          passing its props to its children as needed.
 *
 *
 * */
export default function KmapContext(props) {

    console.log("KmapContext: props=", props);

    // eslint-disable-next-line
    const [kmapId, setKmapId] = useState("");
    const [kmasset, setKmAsset] = useState({});
    const [relateds, setRelateds] = useState({});
    const [kmap, setKmap] = useState({});
    const [loadingState, setLoadingState] = useState (false);

    // const [relatedType, setRelatedType] = useState( "all");
    const [relatedPage, setRelatedPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);  // TODO this should be a configuration
    const params = useParams();
    const {id, relatedType} = params;

    const pager = {
        getMaxPage: () => {
            if (!relateds.assets) {
                return 0;
            } else {
                const maxCount = relateds.assets[relatedType].count;
                const maxPage = Math.floor((maxCount-1) / pageSize);
                console.log( "getMaxPage(): pageSize = ",pageSize, " maxCount = ",maxCount," => maxPage = ", maxPage);
                return maxPage;
            }
        },
        getPage: () => {
            return relatedPage
        },
        setPage: (pg) => {
            pg = Number(pg);
            const maxCount = relateds.assets[relatedType].count;
            const maxPage = Math.floor(maxCount / pageSize);
            pg = (_.isNaN(pg))?0:pg;
            if (pg > maxPage) {
                setRelatedPage(() => maxPage);
            } else if (pg < 0) {
                setRelatedPage(() => 0);
            } else {
                setRelatedPage(() => pg);
            }
        },
        setPageSize: (size) => {
            size = Number(size);
            let oldSize = Number(size);
            let oldPage = Number(relatedPage);
            size=(size < 1)?1:size;
            size=_.isNaN(size)?oldSize:size;
            setPageSize(size);
            let newPage = Math.floor((pageSize / oldSize) * oldPage);
            // console.log("newPage: " + newPage + " oldPage: " + oldPage + " pageSize = " + pageSize + " oldSize = " + oldSize);
            newPage= _.isNaN(newPage)?0:newPage;
            pager.setPage(newPage);
        },
        getPageSize: () => {
            return pageSize;
        },

    }

    if (!props.children) {
        let output = <h2>No Children?</h2>;
        return output;
    } else {

        let changed = false;

        const start = relatedPage * pageSize;

        console.log("KmapContext: id = " + id + " relatedType = " + relatedType);

        const promises = [getAssetDataPromise(id),
            getFullKmapDataPromise(id),
            getRelatedAssetsPromise(id, relatedType, start, pageSize)];

        Promise.allSettled(promises).then(([kmasset_result, kmap_result, relateds_result]) => {

            const {status: kmasset_status, value: new_kmasset} = kmasset_result;
            const {status: kmap_status, value: new_kmap} = kmap_result;
            const {status: relateds_status, value: new_relateds} = relateds_result;

            let kmprops = {};

            if (new_kmap && (kmap_status === 'fulfilled') && kmap.uid !== new_kmap.uid) {
                kmprops.kmap = new_kmap;
                setKmap(new_kmap);
                setKmapId(id);
                changed = true;
            }
            if (new_kmasset && kmasset_status === 'fulfilled' && kmasset.uid !== new_kmasset.uid) {
                kmprops.kmasset = new_kmasset;
                setKmAsset(new_kmasset);
                changed = true;
            }

            console.log("relateds looks like: ", new_relateds);
            if (relateds_status === 'fulfilled' && relateds.stateKey !== new_relateds.stateKey) {
                kmprops.relateds = new_relateds;
                setRelateds(new_relateds);
                changed = true;
            }

            if (changed && props.onStateChange) {
                props.onStateChange({id: id, kmap: kmap, kmasset: kmasset, relateds: relateds, pager: pager});
            }
        }).catch(e => {
            console.error("oh dear! ", e)
        });
    }


    const ret_children = React.Children.map(props.children, (child) => {
        if (child.type) {
            const new_child = React.cloneElement(child, {
                id: id,
                kmap: kmap,
                kmasset: kmasset,
                relateds: relateds,
                pager: pager
            });
            return new_child;
        } else {
            return child;
        }
    });
    return ret_children;
}






