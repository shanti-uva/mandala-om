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
    currentFeatureId = '',
}) {
    const el = useRef(null);
    let history = useHistory();
    let params = useParams();
    var featureId = '';
    if (currentFeatureId && currentFeatureId.startsWith(domain)) {
        featureId = currentFeatureId;
    }

    useEffect(() => {
        //Setup solr utils
        const ks_opts = {
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            assetIndex: process.env.REACT_APP_SOLR_KMASSETS,
            featureId: featureId,
            domain: domain,
            perspective: perspective,
            view: view,
            tree: tree,
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL + `/${domain}/%%ID%%`,
        };

        // console.log('FancyTree: tree=', tree, ' kmapSolrUtil opts = ', ks_opts);

        const solrUtils = kmapsSolrUtils.init(ks_opts);

        const elCopy = $(el.current);
        const tree_opts = {
            domain: domain,
            featureId: featureId,
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL + `/${domain}/%%ID%%`,
            perspective: perspective,
            tree: tree,
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            assetIndex: process.env.REACT_APP_SOLR_KMASSETS,
            descendants: descendants,
            descendantsFullDetail: false,
            directAncestors: directAncestors,
            displayPopup: displayPopup,
            mandalaURL: process.env.REACT_APP_PUBLIC_URL + `/${domain}/%%ID%%`,
            solrUtils: solrUtils,
            view: view,
            sortBy: sortBy,
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
        };

        // console.log('FancyTree: tree=', tree, ' tree_opts = ', tree_opts);

        elCopy.kmapsRelationsTree(tree_opts);
        return () => {
            elCopy.fancytree('destroy');
        };
    }, []); //useEffect

    return <div className="suiFancyTree view-wrap" ref={el}></div>;
}

export default FancyTree;
