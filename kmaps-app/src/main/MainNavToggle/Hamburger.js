import React from 'react';

export function Hamburger(props) {
    const helpIcon = '\ue67e';
    const homeIcon = '\ue60b';
    const openclass = props.hamburgerOpen ? 'open' : 'closed';
    const hamburger = (
        <div className={`sui-hamburger ${openclass}`} id="sui-hamburger">
            <span id="sui-help" className="sui-hamItem">
                {helpIcon}&nbsp;&nbsp;HELP GUIDE
            </span>
            <span id="sui-home" className="sui-hamItem">
                {homeIcon}&nbsp;&nbsp;HOME
            </span>
        </div>
    );
    return hamburger;
}
