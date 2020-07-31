import React from 'react';
import { MandalaPopover } from '../../common/MandalaPopover';
import './TermsDetails.css';

const TermsDetails = (props) => {
    return (
        <div className="sui-termsDetails__wrapper">
            <ul className="sui-termsDetails__list">
                {props.kmAsset?.associated_subject_map_idfacet?.map((asset) => {
                    const assetSplit = asset.split('|');
                    const assocSubject = assetSplit[1].split('=');
                    const subID = assocSubject[1].split('-');
                    return (
                        <li className="sui-termsDetails__list-item" key={asset}>
                            {assetSplit[0].split('=')[0].toUpperCase()}: {` `}
                            {/*<span className="sui-termsDetails__li-subjects">
                                {assocSubject[0]}
                            </span>*/}
                            <MandalaPopover domain={subID[0]} kid={subID[1]} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TermsDetails;
