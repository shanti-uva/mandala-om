import React, {useState} from 'react';
import { useParams } from "react-router";

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

    const [kmapId, setKmapId] = useState("");
    const [kmasset, setKmAsset] = useState({});
    const [kmap, setKmap] = useState({});
    const { id } = useParams();

    if (!props.children) {
        let output = <h2>No Children?</h2>;
        return output;
    } else {
        if (typeof props.sui !== 'object') {
            throw new Error("sui must be passed as a property to the component!");
        }
        if (typeof props.sui.pages !== 'object') {
            throw new Error("sui.pages must be passed as part of the sui passed to the constructor!");
        }

        // if (id) {
        //     setKmapId(id);
        // }

        let kmprops = {};

        let changed = false;

        props.sui.GetKmapFromID(id, (new_kmasset) => {
            props.sui.GetChildDataFromID(id, (new_kmap) => {
                if (kmap.uid !== new_kmap.uid) {
                    kmprops.kmap = new_kmap;
                    setKmap(new_kmap);
                    changed=true;
                }
                if (kmasset.uid !== new_kmasset.uid) {
                    kmprops.kmaset = new_kmasset;
                    setKmAsset(new_kmasset);
                    changed=true;
                }

                if (changed && props.onStateChange) {
                    props.onStateChange ( { id: id, kmap: kmap, kmasset: kmasset} );
                }
            });
        });

        const ret_children = React.Children.map(props.children, (child) => {
            if (child.type) {
                const new_child = React.cloneElement(child, {id:id, kmap: kmap, kmasset: kmasset});
                return new_child;
            } else {
                return child;
            }
        });
        return ret_children;
    }
}





