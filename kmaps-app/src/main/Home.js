import { Link } from 'react-router-dom';
import React from 'react';

export function Home(props) {
    return (
        <div>
            <h2>Home</h2>

            <h3>Work-in-Progress</h3>
            <ul>
                <li>
                    <Link to={'/terms/terms-12434'}>/terms/terms-12434</Link>
                </li>
                <li>
                    <Link to={'/terms/terms-45057'}>/terms/terms-45057</Link>
                </li>
                <li>
                    <Link to={'/terms/terms-85193'}>/terms/terms-85193</Link>
                </li>
                <li>
                    <Link to={'/terms/places-16408'}>/terms/places-16408</Link>
                </li>
                <li>
                    <Link to={'/search'}>/search</Link>
                </li>
                <li>
                    <Link to={'/texts/16230'}>
                        Text: Introduction to Drepung Colleges
                    </Link>
                </li>
                <li>
                    <Link to={'/texts/63401'}>Text: Bogus Multi Page Doc</Link>
                </li>
                <li>
                    <Link to={'/texts/46641'}>Text: Veronoica’s Test</Link>
                </li>
                <li>
                    <Link to={'/texts/50751'}>
                        Text: Hagar of The Pawn-Shop
                    </Link>
                </li>
                <li>
                    <Link to={'/audio-video/256'}>
                        Video: Women Discuss Their Dreams
                    </Link>
                </li>
                <li>
                    <Link to={'/audio-video/306'}>
                        Video: Dawa and Pudrön Flirt
                    </Link>
                </li>
            </ul>

            <h3>Semi-functional Asset Viewers</h3>
            <ul>
                <li>
                    <Link to={'/assets/terms-85193'}>/assets/terms-85193</Link>{' '}
                    (Legacy)
                </li>
            </ul>

            <h3>Dys-functional legacy viewer</h3>
            <ul>
                <li>
                    <Link to={'/assets/subjects-6752'}>
                        /assets/subjects-6752
                    </Link>
                </li>
                <li>
                    <Link to={'/assets/places-637'}>/assets/places-637</Link>
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
                    <a href={'/poptest/places/637'}>Kmaps Popover Test Page</a>
                </li>
            </ul>
        </div>
    );
}
