import {Link} from "react-router-dom";
import React from "react";

export function Home(props) {
    return <div><h2>Home</h2>

        <h3>Semi-functional legacy viewer</h3>
        <ul>
            <li><Link to={'/view/assets/terms-85193'}>/view/assets/terms-85193</Link></li>
            <li><Link
                to={'/view/assets/texts-dev_shanti_virginia_edu-16202'}>/view/assets/texts-dev_shanti_virginia_edu-16202</Link>
            </li>
        </ul>

        <h3>Dys-functional legacy viewer</h3>
        <ul>
            <li><Link to={'/view/assets/subjects-6752'}>/view/assets/subjects-6752</Link></li>
            <li><Link to={'/view/assets/places-637'}>/view/assets/places-637</Link></li>
        </ul>

        <h3>Work-in-Progress</h3>
        <ul>
            <li><Link to={'/view/terms/terms-12434'}>/view/terms/terms-12434</Link></li>
        </ul>
    </div>
}