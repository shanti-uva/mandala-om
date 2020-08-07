import { Link } from 'react-router-dom';
import React from 'react';
import { Jumbotron, Toast } from 'react-bootstrap';
import JSXExpressionContainerMock from 'eslint-plugin-jsx-a11y/__mocks__/JSXExpressionContainerMock';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../Om.css';

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

                            <h4>Texts</h4>
                            <ul>
                                <li>
                                    <Link to={'/texts/16230'}>
                                        Text: Introduction to Drepung Colleges
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/texts/63401'}>
                                        Text: Bogus Multi Page Doc
                                    </Link>{' '}
                                    has popover examples
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

                            <h4>Audio-Video</h4>
                            <ul>
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
                                    <a href={'/poptest/places/637'}>
                                        Kmaps Popover Test Page
                                    </a>
                                </li>
                            </ul>
                        </Jumbotron>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
