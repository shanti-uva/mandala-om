import React from 'react';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import CustomSelect from './CustomSelect';
import './TermsDefinitionsFilter.css';

const TermsDefinitionsFilter = (props) => {
    const params = useParams();
    let { relatedType, definitionID } = params;

    const relatedDocs =
        props?.relateds?.assets[relatedType.toLowerCase()]?.docs ?? [];
    const relatedKmapIDS = _.chain(relatedDocs)
        .map((doc) => doc.kmapid)
        .flatten()
        .uniq()
        .filter((kmapid) => kmapid.includes('_definitions-'))
        .sort()
        .value();

    const definitions = props?.kmap?._childDocuments_ ?? [];
    const relatedDefs = _.chain(definitions)
        .filter((def) => relatedKmapIDS.includes(def.id))
        .map((def) => ({
            id: def.id,
            text: def.related_definitions_content_s.replace(
                /(<([^>]+)>)/gi,
                ''
            ),
        }))
        .value();

    return <CustomSelect definitions={relatedDefs} defID={definitionID} />;
};

export default TermsDefinitionsFilter;
