import React, {useState, useRef} from 'react';
import {Link, withRouter} from 'react-router-dom';
// import $ from "jquery";
import _ from 'lodash';
import * as PropTypes from "prop-types";

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
                </div>;
        }


        // if (!this.state.id.match(/^terms-\d+/)) {
        //     return ERROR;
        // } else {
        return output;

        // }


        function buildNestedDocs(docs, child_type, path_field) {

            path_field = (path_field) ? path_field : child_type + "_path_s";

            const base = {};
            docs = _.filter(docs, (x) => {
                return x.block_child_type === child_type;
            });
            docs = _.sortBy(docs, (x) => [path_field]);

            console.log("buildNestedDocs: ", docs)

            _.forEach(docs, (doc) => {
                console.log("buildNestedDocs: pathField = " + path_field);
                const path = doc[path_field].split('/');
                console.log("buildNestedDocs path = " + path);

                console.log("buildNestedDocs path.length == " + path.length);
                if (path.length === 1) {
                    // this is a "root doc", push it on the base list
                    base[path[0]] = doc;
                } else {
                    // this is a "nested doc"
                    // this is a "nested doc"

                    // check for each "ancestor"
                    // create  "fake ancestor", if it doesn't exist
                    // add the doc to its parent in _nestedDoc_ field
                    //      created _nestedDoc_ field if it doesn't exist
                    //      if it already exists (it might have been faked earlier), populate fields
                    console.log("buildNestedDocs: nested path = ", path);
                    var curr = base;
                    for (let i = 0; i < path.length; i++) {
                        console.log("buildNestedDocs segment: " + path.slice(0, i + 1).join("/"));
                        if (!curr[path[i]]) {
                            curr[path[i]] = {};
                        }
                        if (i === path.length - 1) {
                            curr[path[i]] = doc;
                        }
                        if (!curr[path[i]]._nested_) {
                            curr[path[i]]._nested_ = {};
                        }
                        curr = curr[path[i]]._nested_;
                    }

                }
            })
            console.log("buildNestedDocs:", base);
            return base;
        }


        function TermNames(props) {

            console.log("calling buildNestedDocs");
            const namesTree = buildNestedDocs(props.kmapchild._childDocuments_, "related_names");

            let output = <div><h3>Names</h3>
                <ul className={"sui-nameEntry"}><NameEntry names={namesTree}/></ul>
            </div>
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
                            <span className={"sui-nameEntry-writing-system"}>{entry.related_names_writing_system_s}</span>
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


            if (!audioUrl) {
                return <div/>
            }

            return <div className={"sui-audioPlayer"}>
                <audio src={audioUrl} ref={ref => player.current = ref}/>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    return false;
                }}>
                    <h3>Audio</h3>
                    <button onClick={() => {
                        player.current.play();
                    }}><span>{ '\ue60a' }</span>
                    </button>
                    <select onChange={e => handleSelect(e)}>{option_list}></select>
                    {/*<pre>{JSON.stringify(audioRefs, undefined, 2)}</pre>*/}
                </form>
            </div>
        }

        function Definitions(props) {

            const definitions = buildNestedDocs(props.kmapchild._childDocuments_, "related_definitions");

            return <div><h3>Definitions:</h3>
                <pre>{JSON.stringify(definitions, undefined, 3)}</pre>
            </div>
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