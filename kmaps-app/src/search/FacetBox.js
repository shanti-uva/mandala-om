import React, {useState} from "react";
import Badge from "react-bootstrap/Badge";
import _ from 'lodash';

export function FacetBox(props) {
    const [open, setOpen] = useState(false);
    let chosen_icon = props.icon;
    const assetType = props.assetType;
    const filters = props.filters;
    // console.log("FacetBox Filters: ", filters);

    const ICON_MAP = {
        "audio-video": "\ue648",
        "texts": "\ue636",
        "images": "\ue62a",
        "sources": "\ue631",
        "visuals": "\ue63b",
        "places": "\ue62b",
        "subjects": "\ue634",
        "terms": "\ue635",
        "collections": "\ue633",
        "recent-searches": "\ue62e",
        "assets": "\ue60b",
        "users": "\ue600",
        "languages": "\ue670"
    }
    chosen_icon = chosen_icon || ICON_MAP[assetType];
    const icon = chosen_icon;
    const plus = "\ue669";
    const minus = "\ue66a";
    const label = props.label || "UNKNOWN LABEL";


    // console.debug("FacetBox: props = ", props);

    function parseEntry(entry, fullEntry) {
        // console.log("FacetBox.parseEntry: " + JSON.stringify(entry));
        let [ label, uid ] = entry.val.split("|");
        label=label?label:"undefined";
        const extra = (fullEntry && uid)?<span>({uid})</span>:"";
        const fullLabel = <span>{_.startCase(_.lowerCase(label))} {extra}</span>
        return fullLabel;
    }

    const facetList = _.map(props.facets?.buckets, (entry) => {
        // Adjust
        const iconClass = "shanticon-" + entry.val;
        const value = parseEntry(entry);
        const count = entry.count;
        return <div className="sui-advEditLine" id="sui-advEditLine-0"><span className={iconClass}></span> {value} ({count}) </div>
    });

    const facetBox =
        <div className='sui-advBox' id={"sui-advBox-" + props.id}>
            <div className={'sui-advHeader'} id={'sui-advHeader-A'}
                 onClick={() => setOpen(!open)}>{icon}&nbsp;&nbsp;{label}
                {/* TODO: refactor setOpen to be css-based */}
                <span id={'sui-advPlus-' + props.id} style={{float: 'right'}}><Badge  pill variant={   facetList.length?"primary":"secondary" }>{ facetList.length }</Badge> {open ? minus : plus}</span>
            </div>

            <div className={'sui-advTerm'} id={'sui-advTerm-' + props.id}>
            </div>
            <div className={'sui-advEdit ' + ((open) ? "open" : "closed")} id={'sui-advEdit-' + props.id}>
                {/* TODO: refactor style to css*/}
                <input placeholder='Search this list' value='' style={{
                    width: '90px',
                    border: '1px solid #999',
                    borderRadius: '12px',
                    fontSize: '11px',
                    paddingLeft: '6px'
                }}/>
                {facetList}
            </div>
        </div>;
    return facetBox;
}