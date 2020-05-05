import React from 'react';
import logo from './logo.svg';
import {Counter} from './features/counter/Counter';
import './Om.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
} from 'react-router-dom';

function App() {
    return (
        <Router>
            {/*<div id={'router'}>*/}
            {/*    <ul>*/}
            {/*        <li><Link to={"/"}>Home</Link></li>*/}
            {/*        <li><Link to={"/counter"}>Counter</Link></li>*/}
            {/*        <li><Link to={"/headspace"}>Head Space</Link></li>*/}
            {/*    </ul>*/}
            {/*</div>*/}
            <div>
                <Switch>
                    <Route path="/counter">
                        <CounterPage/>
                    </Route>
                    <Route path="/headspace">
                        <HeadSpace/>
                    </Route>
                    <Route path="/">
                        <Base/>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
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

class Base extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advanced: false
        };
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    render() {
        const base =
            <div id={'sui-main'} className={'sui-main'}>
                <TopBar/>
                <SearchBar onStateChange={this.handleStateChange}/>
                <SearchLeft/>
                <SearchAdvanced advanced={this.state.advanced}/>
                <Hamburger/>
            </div>
        return base;
    }

    handleStateChange(state) {
        this.setState(state, () => { console.log("Uber State now: " + JSON.stringify(this.state));});
    }
}

function TopBar() {
    const topBar = <div className={'sui-topbar'}><img src={'img/bhutanleft.gif'} style={{cursor: 'pointer'}}
                                                      alt={'Home Page'}></img></div>
    return topBar;
}

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = { advanced: false };
        this.handleAdvancedChange = this.handleAdvancedChange.bind(this);
    }

    render() {
        const searchbar =
            <div id='sui-top' className='sui-top'>
                <div style={{display: 'inline-block'}}>
                    <div className='sui-search1'>
                        <input type='text' id='sui-search' className='sui-search2' placeholder='Enter Search'/>
                        <div id='sui-clear' className='sui-search3'>&#xe610;</div>
                    </div>
                    <div id='sui-searchgo' className='sui-search4'>&#xe623;</div>
                    <AdvancedToggle onAdvancedChange={this.handleAdvancedChange} advanced={this.state.advanced}/>
                    <div id='sui-hamBut' className='sui-hamBut' title='Help + options'>&#xe627;</div>
                </div>
            </div>;
        return searchbar;
    }

    handleAdvancedChange(adv) {
        this.setState({ advanced: adv }, () => {
                console.log("Advanced State now: " + JSON.stringify(this.state.advanced));
                this.props.onStateChange(this.state);
        });
    }
}

function SearchLeft() {
    const left =
        <div id='sui-left' className='sui-left'>
            <div id='sui-header' className='sui-header'>
                <div id='sui-headLeft' className='sui-headLeft'>LEFT</div>
            </div>
            <div id='sui-results' className='sui-results scrollbar'></div>
        </div>;
    return left;
}

class SearchAdvanced extends React.Component {

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log(JSON.stringify(arguments));
        return (nextProps) ? true : false;
    }

    render() {
        const advanced =
            <div id='sui-adv' className='sui-adv'>

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

                <FacetBox id='squawk' label="recent searches" assetType="recent-searches"/>

                <div style={{"marginTop": '14px', float: 'right', "fontSize": '13px'}}>
                    <div>Show Boolean Controls? &nbsp;<input type='checkbox' id='sui-showBool'
                                                             defaultChecked={'checked'}></input></div>
                </div>
                <div id='sui-footer' className='sui-footer'></div>
            </div>;
        return (this.props.advanced)?advanced:null;
    }
}

function Hamburger() {
    const hamburger =
        <div className='sui-hamburger' id='sui-hamburger'>
        </div>
    return hamburger;
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
        "assets": "\ue60b"
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

    setAdvanced(advanced) {
        this.props.onAdvancedChange(advanced);
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

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (nextProps) ? true : false;
    }

    render() {
        const label = (this.props.advanced)?BASIC_LABEL:ADVANCED_LABEL;
        return (
            <div onClick={this.toggleAdvanced} id='sui-mode' className='sui-search5'
                 title='{label}'>{label}</div>
        )
    }
}

export default App;
