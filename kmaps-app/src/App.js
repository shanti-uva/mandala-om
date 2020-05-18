import React from 'react';
import logo from './logo.svg';
import {Counter} from './features/counter/Counter';

import {AudioVideoViewer} from "./views/AudioVideoViewer";
import {ImagesViewer} from "./views/ImagesViewer";
import {TextsViewer} from "./views/TextsViewer";
import {VisualsViewer} from "./views/VisualsViewer";
import {SourcesViewer} from "./views/SourcesViewer";
import {PlacesViewer} from "./views/PlacesViewer";
import {SubjectsViewer} from "./views/SubjectsViewer";
import {TermsViewer} from "./views/TermsViewer";
import {CollectionsViewer} from "./views/CollectionsViewer";
import {RelatedsViewer} from "./views/RelatedsViewer";

import SearchUI from "./legacy/searchui";
import Pages from "./legacy/pages";

import './Om.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams,
    withRouter
} from 'react-router-dom';


class App extends React.Component {

    constructor(props) {
        super();

        if (!window.sui) {
            window.sui = new SearchUI();
        }
        this.sui = window.sui;

        if (!window.sui.pages) {
            this.sui.pages = window.sui.pages = new Pages(this.sui);
        }

    }

    render() {
        return (
            <Router>
                {/*<div id={'router'}>*/}
                {/*    <ul>*/}
                {/*        <li><Link to={"/"}>Home</Link></li>*/}
                {/*        <li><Link to={"/counter"}>Counter</Link></li>*/}
                {/*        <li><Link to={"/headspace"}>Head Space</Link></li>*/}
                {/*    </ul>*/}
                {/*</div>*/}
                <Switch>
                    <Route path="/counter">
                        <CounterPage/>
                    </Route>
                    <Route path="/headspace">
                        <HeadSpace/>
                    </Route>
                    <Route path="/">
                        <Main sui={this.sui}/>
                    </Route>
                </Switch>
            </Router>
        );
    };
}

function CounterPage() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <Counter/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <div>
                    <span>Learn </span>
                    <a
                        className="App-link"
                        href="https://reactjs.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        React
                    </a>
                    <span>, </span>
                    <a
                        className="App-link"
                        href="https://redux.js.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Redux
                    </a>
                    <span>, </span>
                    <a
                        className="App-link"
                        href="https://redux-toolkit.js.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Redux Toolkit
                    </a>
                    ,<span> and </span>
                    <a
                        className="App-link"
                        href="https://react-redux.js.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        React Redux
                    </a>
                </div>
            </header>
        </div>
    )
}

function HeadSpace() {
    let markup =
        <div>
            <h3>NOT MUCH HEAD SPACE</h3>
            <ul>
                <li>oink oink oink says the pig</li>
                <li>bah bah bah says the lamb</li>
                <li>neigh neigh neigh says the horse</li>
                <li>what what what says the programmer</li>
            </ul>
        </div>;
    return markup;
}

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            advanced: false,
            kmap: {
                header: "Mandala",
                title: ["Mandala"],
                uid: "mandala",
            },
            sui: this.props.sui
        };
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    render() {
        const main =
            <div id={'sui-main'} className={'sui-main'}>
                <div>
                    <TopBar/>
                    <SearchBar onStateChange={this.handleStateChange}/>
                    <SearchLeft site={'mandala'} mode={'development'} title={'Mandala'} sui={this.state.sui}
                                kmap={this.state.kmap} onStateChange={this.handleStateChange}/>
                    <SearchAdvanced advanced={this.state.advanced}/>
                    <Hamburger hamburgerOpen={this.state.hamburgerOpen}/>
                </div>
            </div>
        return main;
    }

    handleStateChange(newstate) {
        console.log("Uber State Change requested: " + JSON.stringify(newstate));
        if (newstate.kmap && (newstate.kmap.id === this.state.kmap.id)) {
            return;
        }
        this.setState(newstate);
    }

}

function TopBar() {
    const topBar = <div className={'sui-topbar'}><img src={'/img/bhutanleft.gif'} style={{cursor: 'pointer'}}
                                                      alt={'Home Page'}></img></div>
    return topBar;
}

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {advanced: false, hamburgerOpen: false};
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const searchbar =

            <div id='sui-top' className='sui-top'>
                <form onSubmit={this.handleSubmit}>
                <div style={{display: 'inline-block'}}>
                        <div className='sui-search1'>
                            <input type='text' id='sui-search' className='sui-search2' placeholder='Enter Searchy'
                                   onChange={this.handleInputChange}/>
                            <div id='sui-clear' className='sui-search3'>&#xe610;</div>
                        </div>
                    <div id='sui-searchgo' className='sui-search4' onClick={this.handleSubmit}>&#xe623;</div>
                    <AdvancedToggle onStateChange={this.handleStateChange} advanced={this.state.advanced}/>
                    <HamburgerToggle onStateChange={this.handleStateChange}
                                     hamburgerOpen={this.state.hamburgerOpen}/>
                </div>
                </form>
            </div>;
        return searchbar;
    }

    handleInputChange(event) {
        console.log("Input Change", event.target.value);
        this.setState( { search: event.target.value });
    }

    handleSubmit(event) {
        console.log("Submit", this.state.search );
        event.preventDefault();
    }

    handleStateChange(newstate) {
        this.setState(newstate, () => {
            // console.log("SearchBar State now: " + JSON.stringify(this.state));
            this.props.onStateChange(this.state);
        });
    }
}

class SearchLeft extends React.Component {

    constructor(props) {
        super(props);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.state = {kmap: props.kmap};
    }

    handleStateChange(newstate) {
        // this.setState( newstate );
        console.log("SearchLeft.handleStateChange(): " + JSON.stringify(newstate));
        if (newstate.kmap && this.state.kmap && newstate.kmap.uid != this.state.kmap.uid) {
            console.log("newstate.kmap.uid = " + newstate.kmap.uid);
            console.log("state.kmap.uid = " + this.state.kmap.uid);
            this.setState(newstate, () => this.props.onStateChange(newstate));
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const next = nextProps.kmap.uid;
        const last = this.state.kmap.uid;

        console.log("next:" + next);
        console.log("last:" + last);

        return true;
    }

    render() {
        const title = this.props.title || "Untitled";
        const siteClass = this.props.site || "defauit";
        const left =
            <div id='sui-left' className='sui-left'>
                <ContentHeader siteClass={siteClass} title={title} sui={this.props.sui} kmap={this.props.kmap}/>
                {/*<Display siteClass={siteClass} />*/}
                <div id={"sui-results"}>
                    <Router>
                        <Switch>
                            <Route path="/view">
                                <AssetViewer sui={this.props.sui} kmap={this.props.kmap}
                                             onStateChange={this.handleStateChange}/>
                            </Route>
                            <Route exact path="/">
                                <Home/>
                            </Route>
                            <Route path="*">
                                <Error404/>
                            </Route>
                        </Switch>
                    </Router>
                </div>
                {/*<div id={'sui-legacy'} className={'legacy sui-legacy'}></div>*/}
                {/*<div id={'sui-legacy-related'} className={'legacy sui-legacy-related'}></div>*/}
            </div>;
        return left;
    }
}


function Home(props) {
    return <h2>Home</h2>;
}

class ContentHeader extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        console.error("RECEIVED PROPS", props);
    }

    // static getDerivedStateFromProps(props,state) {
    //     console.log("ContentHeader: getDerivedStatefromProps()");
    //     console.log("ContentHeader: props", props);
    //     console.log("ContentHeader: state", state);
    //
    //     let newstate = state;
    //     if (props.sui.curResults && props.sui.curResults.length) {
    //         newstate = props.sui.curResults[0];
    //     }
    //     return newstate;
    // }

    render() {
        console.log("ContentHeader render() with " + JSON.stringify(this.props.kmap));
        const cheader =
            <div id='sui-header' className={`sui-header legacy ${this.props.siteClass}`}>
                <div id='sui-headLeft' className='sui-headLeft legacy'>
                    <div>
                        <span>{this.props.kmap.title}</span>
                        <span>({this.props.kmap.uid})</span>
                    </div>
                </div>
            </div>;
        return cheader;
    }
}

class Display extends React.Component {
    render() {
        const display = <div id={'om-display'} className={`om-display scrollbar ${this.props.siteClass}`}></div>
        return display
    }
}

class AssetViewer extends React.PureComponent {

    constructor(props) {
        super(props);
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    handleStateChange(newstate) {
        if (!this.state || newstate.id !== this.state.id) {
            this.setState(newstate);
        }
        this.props.onStateChange(newstate);
    }


    //  This is  PureComponent and has its own implementation of shouldComponentUpdate()
    //
    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //
    //     console.error("shouldComponentUpdate ", arguments);
    //     return false;
    //
    // }

    render() {
        return <Router>
            <Switch>
                // I don't understand why you need to do this
                <Route path="/view/:asset/:id"
                       component={props => <ShowAsset sui={this.props.sui} kmap={this.props.kmap} match={props.match}
                                                      onStateChange={this.handleStateChange}/>}/>
                <Route path="/view/:asset">
                    <ShowAsset sui={this.props.sui} kmap={this.props.kmap} onStateChange={this.props.onStateChange}/>
                </Route>
                <Route path={"*"}>
                    <h2>Unknown params</h2>
                </Route>
            </Switch>
        </Router>
    }
}

class ShowAsset extends React.Component {

    constructor(props) {
        super(props);
        console.error("ShowAsset constructor");
        console.dir(props);
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    handleStateChange(newstate) {
        this.props.onStateChange(newstate);
    }

    render() {
        const {asset, id} = this.props.match.params;
        const sui = this.props.sui;
        const kmap = this.props.kmap;
        if (!sui) {
            throw new Error("This is no sui!")
        }

        return <Router>
            <Switch>
                <Route path="/view/audio-video/:id">
                    <AudioVideoViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/images/:id">
                    <ImagesViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/texts/:id">
                    <TextsViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/sources/:id">
                    <SourcesViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/visuals/:id">
                    <VisualsViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/places/:id">
                    <PlacesViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/subjects/:id">
                    <SubjectsViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/terms/:id">
                    <RelatedsViewer id={id} sui={window.sui} onStateChange={this.handleStateChange}/>
                    <TermsViewer id={id} sui={window.sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/collections/:id">
                    <CollectionsViewer id={id} sui={window.sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="*">
                    <Error404/>
                </Route>
            </Switch>
        </Router>
    }
}

class SearchAdvanced extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        const openclass = this.props.advanced ? "open" : "closed";
        const advanced =
            <div id='sui-adv' className={`sui-adv ${openclass}`}>

                <FacetBox id='squawk' label="item type" assetType="assets"/>

                <FacetBox id='squawk' label="audio-video" assetType="audio-video"/>
                <FacetBox id='squawk' label="images" assetType="images"/>
                <FacetBox id='squawk' label="texts" assetType="texts"/>
                <FacetBox id='squawk' label="images" assetType="images"/>
                <FacetBox id='squawk' label="sources" assetType="sources"/>
                <FacetBox id='squawk' label="visual" assetType="visuals"/>
                <FacetBox id='squawk' label="subjects" assetType="subjects"/>
                <FacetBox id='squawk' label="places" assetType="places"/>
                <FacetBox id='squawk' label="texts" assetType="texts"/>
                <FacetBox id='squawk' label="collections" assetType="collections"/>
                <FacetBox id='squawk' label="languages" assetType="languages"/>

                <FacetBox id='squawk' label="users" assetType="users"/>
                <FacetBox id='squawk' label="languages" assetType="languages"/>

                <FacetBox id='squawk' label="recent searches" assetType="recent-searches"/>

                <div style={{"marginTop": '14px', float: 'right', "fontSize": '13px'}}>
                    <div>Show Boolean Controls? &nbsp;<input type='checkbox' id='sui-showBool'
                                                             defaultChecked={'checked'}></input></div>
                </div>
                <div id='sui-footer' className='sui-footer'></div>
            </div>;
        return advanced;
    }
}

class Hamburger extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const helpIcon = "\ue67e";
        const homeIcon = "\ue60b";
        const openclass = this.props.hamburgerOpen ? "open" : "closed";
        const hamburger =
            <div className={`sui-hamburger ${openclass}`} id='sui-hamburger'>
                <span id='sui-help' className='sui-hamItem'>{helpIcon}&nbsp;&nbsp;HELP GUIDE</span>
                <span id='sui-home' className='sui-hamItem'>{homeIcon}&nbsp;&nbsp;HOME</span>
            </div>
        return hamburger;
    }
}

function FacetBox(props) {

    let chosen_icon = props.icon;
    const assetType = props.assetType;

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
    const label = props.label || "UNKNOWN LABEL";

    const facetBox =
        <div className='sui-advBox' id={"sui-advBox-" + props.id}>
            <div className={'sui-advHeader'} id={'sui-advHeader-A'}>{icon}&nbsp;&nbsp;{label}
                <span id={'sui-advPlus-' + props.id} style={{float: 'right'}}>{plus}</span>
            </div>
            <div className={'sui-advTerm'} id={'sui-advTerm-' + props.id}></div>
            <div className={'sui-advEdit'} id={'sui-advEdit-' + props.id}></div>
        </div>;
    return facetBox;
}

export const ADVANCED_LABEL = "Advanced Search";
export const BASIC_LABEL = "Basic Search";

class AdvancedToggle extends React.Component {

    constructor(props) {
        super(props);

        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.setAdvanced = this.setAdvanced.bind(this);
    }

    setAdvanced(adv) {
        // send state change message
        this.props.onStateChange({advanced: adv});
    }

    toggleAdvanced() {
        this.setAdvanced(!this.props.advanced);
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
    }

    componentDidCatch(error, errorInfo) {
    }

    render() {
        const label = (this.props.advanced) ? BASIC_LABEL : ADVANCED_LABEL;
        return (
            <div onClick={this.toggleAdvanced} id='sui-mode' className='sui-search5'
                 title='{label}'>{label}</div>
        )
    }
}


class HamburgerToggle extends React.Component {

    constructor(props) {
        super(props);

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.setHamburgerOpen = this.setHamburgerOpen.bind(this);
    }

    setHamburgerOpen(hamOpen) {
        // send state change message
        this.props.onStateChange({hamburgerOpen: hamOpen});
    }

    toggleHamburger() {
        this.setHamburgerOpen(!this.props.hamburgerOpen);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
    }

    componentDidCatch(error, errorInfo) {
    }

    render() {
        return (
            <div onClick={this.toggleHamburger} id='sui-hamBut' className='sui-hamBut'
                 title='Help + options'>&#xe627;</div>
        )
    }
}

function Error404() {
    return <div><h2>OUCH!</h2>
        Unknown Path: {window.location.pathname}
    </div>;
}

export default App;
