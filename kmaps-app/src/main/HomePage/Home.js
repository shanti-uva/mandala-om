import { Link } from 'react-router-dom';
import React from 'react';
import { Jumbotron, Toast } from 'react-bootstrap';
import JSXExpressionContainerMock from 'eslint-plugin-jsx-a11y/__mocks__/JSXExpressionContainerMock';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../../Om.css';

export function Home(props) {
    return (
        <div className={'sui-main'} style={{ marginTop: '5em' }}>
            <Container>
                <Row>
                    <Col>
                        <Jumbotron>
                            <h3>Work-in-Progress</h3>

                            <h4>Terms</h4>
                            <ul>
                                <li>
                                    <Link to={'/terms/terms-12434'}>
                                        /terms/terms-12434
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/terms-45057'}>
                                        'gro ba/ (terms-45057)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/terms/terms-85193'}>
                                        thod rgal/: (terms-85193)
                                    </Link>
                                </li>
                            </ul>
                            <h4>Places</h4>
                            <ul>
                                <li>
                                    <Link to={'/places/places-16408'}>
                                        Potala Palace: (places-16408)
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/places/places-637'}>
                                        Lhasa: (places-637)
                                    </Link>
                                </li>
                                <ul>
                                    <li>
                                        <Link
                                            to={
                                                '/places/places-637/related-images/deck'
                                            }
                                        >
                                            Related Images
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={
                                                '/places/places-637/related-audio-video/deck'
                                            }
                                        >
                                            Related Audio-Video
                                        </Link>
                                    </li>
                                </ul>
                                <li>
                                    <Link to={'/places/places-427'}>
                                        Bhutan: (places-427)
                                    </Link>
                                </li>
                                <ul>
                                    <li>
                                        <Link
                                            to={
                                                '/places/places-427/related-images/deck'
                                            }
                                        >
                                            Related Images
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={
                                                '/places/places-427/related-audio-video/deck'
                                            }
                                        >
                                            Related Audio-Video
                                        </Link>
                                    </li>
                                </ul>
                            </ul>
                            <h4>Search</h4>
                            <ul>
                                <li>
                                    <Link to={'/search'}>/search</Link>
                                </li>
                            </ul>

                            <h4>Visuals</h4>
                            <ul>
                                <li>
                                    <Link to={'/visuals/4451'}>
                                        Visuals: Bloodtype Pie Chart
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/5821'}>
                                        Visuals: Vimeo Video
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/1806'}>
                                        Visuals: Graph Indo-European Languages
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/visuals/5266'}>
                                        Visuals: Timeline DH Chronology
                                    </Link>
                                </li>
                            </ul>

                            <h4>Sources</h4>
                            <ul>
                                <li>
                                    <Link to={'/sources/26856'}>
                                        Source: Winternitz Dummy Test
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/sources/87826'}>
                                        Source: 100% Renewable Energy Systems
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/sources/87476'}>
                                        Source: Accounting for Nat. Resources
                                        &amp; Env. Sustainability
                                    </Link>
                                </li>
                            </ul>

                            <h4>Images</h4>
                            <ul>
                                <li>
                                    <Link to={'/images/1421596'}>
                                        Image: Dudul Dorjay Festival Photo
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/160186'}>
                                        Image: High Tibet Chu ser
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/1243906'}>
                                        Image: Lhasa Mural Painting
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/images/45806'}>
                                        Image: Woman on Basum Island
                                    </Link>
                                </li>
                            </ul>

                            <h4>Audio-Video</h4>
                            <ul>
                                <li>
                                    <Link to={'/audio-video/825'}>
                                        Video: Carpenter of Lhagya Ri Palace
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/audio-video/306'}>
                                        Video: Dawa and Pudrön Flirt
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/audio-video/9246'}>
                                        Video: Riddle of the Terma Vase
                                    </Link>{' '}
                                    (Many Agents, Transcript, Tibetan and
                                    Chinese text)
                                </li>
                            </ul>

                            <h4>Texts</h4>
                            <ul>
                                <li>
                                    <Link to={'/texts/16230'}>
                                        Text: Introduction to Drepung Colleges
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/texts/46641'}>
                                        Text: Veronoica’s Test
                                    </Link>{' '}
                                    has embedded video etc.
                                </li>
                                <li>
                                    <Link to={'/texts/50751'}>
                                        Text: Hagar of The Pawn-Shop
                                    </Link>{' '}
                                    has Hagar... and a Pawn Shop.
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
                                    <Link to={'/poptest/places/637'}>
                                        Kmaps Popover Test Page
                                    </Link>
                                </li>
                            </ul>
                        </Jumbotron>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
