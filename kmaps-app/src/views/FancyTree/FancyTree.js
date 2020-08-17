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

function FancyTree(props) {
    const el = useRef(null);
    let history = useHistory();
    let params = useParams();

    useEffect(() => {
        //Setup solr utils
        const solrUtils = kmapsSolrUtils.init({
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            assetIndex: process.env.REACT_APP_SOLR_KMASSETS,
            featureId: '',
            domain: 'terms',
            perspective: 'tib.alpha',
            mandalaURL:
                process.env.REACT_APP_PUBLIC_URL + '/terms/terms-%%ID%%',
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL + '/terms/terms-%%ID%%',
            tree: 'terms',
        });

        const elCopy = $(el.current);
        elCopy.kmapsRelationsTree({
            domain: 'terms',
            featureId: '',
            featuresPath:
                process.env.REACT_APP_PUBLIC_URL + '/%%APP%%/%%APP%%-%%ID%%',
            perspective: 'tib.alpha',
            tree: 'terms',
            termIndex: process.env.REACT_APP_SOLR_KMTERMS,
            descendants: true,
            directAncestors: false,
            displayPopup: false,
            mandalaURL:
                process.env.REACT_APP_PUBLIC_URL + '/%%APP%%/%%APP%%-%%ID%%',
            solrUtils: solrUtils,
            view: 'roman.scholar',
            sortBy: 'position_i+ASC',
            extraFields: ['associated_subject_ids'],
            nodeMarkerPredicates: [
                {
                    field: 'associated_subject_ids',
                    value: 9315,
                    operation: '!includes',
                    mark: 'nonInteractiveNode',
                },
            ],
            history,
            params,
        });
        return () => {
            elCopy.fancytree('destroy');
        };
    }, []);

    return <div className="suiFancyTree" ref={el}></div>;
}

export default FancyTree;
