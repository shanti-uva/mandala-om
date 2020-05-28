import React, {useState, useRef} from 'react';
import {Link, withRouter} from 'react-router-dom';
// import $ from "jquery";
import _ from 'lodash';
import * as PropTypes from "prop-types";
import Definitions from './TermsViewer_Definitions.js';
import {buildNestedDocs} from "./utils";
import Card from "react-bootstrap/Card";

function NodeHeader(props) {
    return <div className={"sui-nodeHeader"}>
        <span className="shanticon-terms"></span>
        &nbsp;&nbsp;&nbsp;
        <span className="sui-termTitle sui-nodeTitle"
              id="sui-termTitle"><span
            className={"sui-nodeTitle-item tibt"}>{props.kmap.name_tibt[0]}</span>&nbsp;&nbsp;&nbsp;<span
            className={"sui-nodeTitle-item latin"}>{props.kmap.name_latin[0]}</span></span>
        <hr style={{"borderTop": "1px solid rgb(162, 115, 63)"}}/>
    </div>;
}

NodeHeader.propTypes = {kmap: PropTypes.any};

class TermsViewer extends React.Component {

    constructor(props) {
        super(props);
        if (typeof props.sui !== 'object') {
            throw new Error("sui must be passed as a property to the component!");
        }

        if (typeof props.sui.pages !== 'object') {
            throw new Error("sui.pages must be passed as part of the sui passed to the constructor!");
        }
        this.sui = props.sui;
        this.props = props;

        // Todo: refactor this call

        console.error("TermsViewer constructor", this.props);
        const id = this.props.id || this.props.match.params.id;
        if (id) {
            this.state = {id: id};
        }

        // TODO: refactor into a Thunk
        this.sui.GetKmapFromID(id, (kmap) => {
            console.dir(kmap);
            if (!this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state = {kmap: kmap};
                // this.sui.pages.Draw(this.state.kmap, true);
                this.sui.GetChildDataFromID(id, (kmapchild) => {
                    if (!this.state || !this.state.kmapchild || kmapchild.uid && kmapchild.uid !== this.state.kmapchild.uid) {
                        this.state = {kmap: kmap, kmapchild: kmapchild};
                        // this.sui.pages.Draw(this.state.kmap, true);
                        this.props.onStateChange(this.state);
                    }
                })
            }
        });
    }

    // static getDerivedStateFromProps(props,state) {
    //     console.log("TermsViewer.getDerivedStateFromProps()", arguments);
    //     return state;
    // }

    componentDidMount() {
        console.log("TermsViewer:componentDidMount");
    }

    render() {
        console.error("TermsViewer render", this.props);
        const ERROR = <div className={'termsviewer'}>
            <div class={"sui-terms"}>
                <div>ERRORINESS</div>
                <div id={'sui-terms'}>id must be a term uid. Try this instead: <Link
                    to={"/view/assets/" + this.state.id}>/view/assets/{this.state.id}</Link></div>
                <div>PLAGNY</div>
            </div>
        </div>;

        const noout = <div className={'termsviewer'}>
            Yawn...
        </div>

        let output = noout;

        if (this.props.kmap && this.props.kmap.asset_type) {
            output =
                <div className={'termsviewer'}>
                    <div className={"sui-terms"}>
                        <NodeHeader kmap={this.props.kmap}/>
                        <TermNames kmapchild={this.props.kmapchild}/>
                        <TermAudioPlayer kmapchild={this.props.kmapchild}/>
                        <Definitions kmapchild={this.props.kmapchild}/>
                        <RelatedTerms kmapchild={this.props.kmapchild}/>
                    </div>
                    {/*<pre>{JSON.stringify(this.props.kmapchild, undefined, 2)}</pre>*/}
                </div>;
        }


        // if (!this.state.id.match(/^terms-\d+/)) {
        //     return ERROR;
        // } else {
        return output;

        // }

        function TermNames(props) {

            console.log("calling buildNestedDocs");
            const namesTree = buildNestedDocs(props.kmapchild._childDocuments_, "related_names");

            let output = <Card>
                <Card.Body><Card.Title>Names</Card.Title>
                    <ul className={"sui-nameEntry"}><NameEntry names={namesTree}/></ul>
                </Card.Body>
            </Card>
            return output;

        }

        /* NameEntry recursively draws the Name Tree
        *   expects: props.names = tree built by buildNestedDocs()
        *
        * Perhaps this should parameterized...?
        *
        */
        function NameEntry(props) {
            let outlist = [];

            Object.entries(props.names).map(([id, entry]) => {
                outlist.push(
                    <li className={"sui-nameEntry"}>
                        <span className={"sui-nameEntry-header"}>{entry.related_names_header_s}</span>
                        <span className={"sui-nameEntry-meta"}>
                            <span className={"sui-nameEntry-language"}>{entry.related_names_language_s}</span>
                            <span className={"sui-nameEntry-relationship"}>{entry.related_names_relationship_s}</span>
                            <span
                                className={"sui-nameEntry-writing-system"}>{entry.related_names_writing_system_s}</span>
                        </span>
                        <ul>
                            <NameEntry names={entry._nested_}/>
                        </ul>
                    </li>
                )
            });
            const output = <React.Fragment>{outlist}</React.Fragment>
            return output;
        }


        function TermAudioPlayer(props) {
            const audioRefs = _.filter(props.kmapchild._childDocuments_, (x) => {
                return x.block_child_type === "terms_recording"
            });

            const player = useRef();
            const defRecordingUrl = audioRefs[0]?.recording_url;

            const [audioUrl, setAudioUrl] = useState(defRecordingUrl);

            const option_list = _.map(audioRefs, (x) => <option
                value={x.recording_url}>{x.recording_dialect_s}</option>);
            const handleSelect = (e) => {
                setAudioUrl(e.target.value)
            }

            const playButton = (audioUrl) ? <>
                    <button onClick={() => {
                        player.current.play();
                    }}><span>{'\ue60a'}</span>
                    </button>
                    <select onChange={e => handleSelect(e)}>{option_list}></select></>
                : "No Audio Available";

            return <Card>
                <div className={"sui-audioPlayer"}>
                    <audio src={audioUrl} ref={ref => player.current = ref}/>
                    <form onSubmit={(event) => {
                        event.preventDefault();
                        return false;
                    }}>
                        <Card.Body>
                            <Card.Title>Audio</Card.Title>
                            {playButton}
                        </Card.Body>
                    </form>
                </div>
            </Card>
        }

        function RelatedTerms(props) {
            const terms = buildNestedDocs(props.kmapchild._childDocuments_, "related_terms");
            return <div><h3>Related Terms</h3>
                <pre>{JSON.stringify(terms, undefined, 3)}</pre>
            </div>
        }
    }

}

export default withRouter(TermsViewer);