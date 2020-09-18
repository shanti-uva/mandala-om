import React, { useEffect, useRef } from 'react';
import fancytree from 'jquery.fancytree';
import { withRouter } from 'react-router';
import { useHistory, useParams } from 'react-router-dom';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';
import 'jquery.fancytree/dist/modules/jquery.fancytree.glyph';
import $ from 'jquery';
import kmapsSolrUtils from './solr-utils';
import './kmaps_relations_tree';
import 'jquery.fancytree/dist/skin-awesome/ui.fancytree.css';
import './FancyTree.css';

function FancyTree({
    domain,
    tree,
    descendants = true,
    directAncestors = false,
    displayPopup = false,
    perspective = 'tib.alpha',
    view = 'roman.scholar',
    sortBy = 'position_i+ASC',
}) {
    const el = useRef(null);
    let history = useHistory();
    let params = useParams();

    useEffect(() => {
        //Setup solr utils
        const solrUtils = kmapsSolrUtils.init({
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            assetIndex: process.env.REACT_APP_SOLR_KMASSETS,
            featureId: params.id,
            domain,
            perspective,
            mandalaURL:
                process.env.REACT_APP_PUBLIC_URL +
                `/${domain}/${domain}-%%ID%%`,
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL +
                `/${domain}/${domain}-%%ID%%`,
            tree,
        });

        const elCopy = $(el.current);
        elCopy.kmapsRelationsTree({
            domain,
            featureId: params.id,
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL +
                `/${domain}/${domain}-%%ID%%`,
            perspective,
            tree,
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            descendants,
            descendantsFullDetail: false,
            directAncestors,
            displayPopup,
            mandalaURL:
                process.env.REACT_APP_PUBLIC_URL +
                `/${domain}/${domain}-%%ID%%`,
            solrUtils: solrUtils,
            view,
            sortBy,
            initialScrollToActive: true,
            // extraFields: ['associated_subject_ids'],
            // nodeMarkerPredicates: [
            //     {
            //         field: 'associated_subject_ids',
            //         value: 9315,
            //         operation: '!includes',
            //         mark: 'nonInteractiveNode',
            //     },
            // ],
            history,
            params,
        });
        return () => {
            elCopy.fancytree('destroy');
        };
    }, []);

    return <div className="suiFancyTree view-wrap" ref={el}></div>;
}

export default FancyTree;
