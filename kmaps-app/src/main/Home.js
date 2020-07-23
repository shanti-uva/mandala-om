import { Link } from 'react-router-dom';
import React from 'react';

export function Home(props) {
    return (
        <div>
            <h2>Home</h2>

            <h3>Work-in-Progress</h3>
            <ul>
                <li>
                    <Link to={'/view/terms/terms-12434'}>
                        /view/terms/terms-12434
                    </Link>
                </li>
                <li>
                    <Link to={'/view/terms/terms-45057'}>
                        /view/terms/terms-45057
                    </Link>
                </li>
                <li>
                    <Link to={'/view/terms/terms-85193'}>
                        /view/terms/terms-85193
                    </Link>
                </li>
                <li>
                    <Link to={'/view/terms/places-16408'}>
                        /view/terms/places-16408
                    </Link>
                </li>
                <li>
                    <Link to={'/view/search'}>/view/search</Link>
                </li>
                <li>
                    <Link to={'/view/texts/16230'}>
                        Text: Introduction to Drepung Colleges
                    </Link>
                </li>
                <li>
                    <Link to={'/view/texts/63401'}>
                        Text: Bogus Multi Page Doc
                    </Link>
                </li>
                <li>
                    <Link to={'/view/texts/46641'}>Text: Veronoica’s Test</Link>
                </li>
                <li>
                    <Link to={'/view/audio-video/256'}>
                        Video: Women Discuss Their Dreams
                    </Link>
                </li>
                <li>
                    <Link to={'/view/audio-video/306'}>
                        Video: Dawa and Pudrön Flirt
                    </Link>
                </li>
            </ul>

            <h3>Semi-functional Asset Viewers</h3>
            <ul>
                <li>
                    <Link to={'/view/assets/terms-85193'}>
                        /view/assets/terms-85193
                    </Link>{' '}
                    (Legacy)
                </li>
            </ul>

            <h3>Dys-functional legacy viewer</h3>
            <ul>
                <li>
                    <Link to={'/view/assets/subjects-6752'}>
                        /view/assets/subjects-6752
                    </Link>
                </li>
                <li>
                    <Link to={'/view/assets/places-637'}>
                        /view/assets/places-637
                    </Link>
                </li>
            </ul>

            <h4>References</h4>
            <ul>
                <li>
                    <a
                        href={
                            'https://www.viseyes.org/ksolr/#s=text:lhasa=assets:All:all:AND'
                        }
                    >
                        KSolr search on Lhasa
                    </a>
                </li>
                <li>
                    <a href={'/view/poptest/places/637'}>
                        Kmaps Popover Test Page
                    </a>
                </li>
            </ul>
        </div>
    );
}
