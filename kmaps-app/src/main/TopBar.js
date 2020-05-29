import {Link} from "react-router-dom";
import React from "react";

export function TopBar() {
    const topBar = <div className={'sui-topbar'}>
        <Link to={'/home'}>
            <img src={'/img/bhutanleft.gif'} style={{cursor: 'pointer'}} alt={'Home Page'} />
        </Link>
    </div>
    return topBar;
}