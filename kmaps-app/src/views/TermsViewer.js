import React from 'react';
import {Link, withRouter} from 'react-router-dom';
// import $ from "jquery";
import _ from 'lodash';

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
            this.state = { id: id };
        }

        // TODO: refactor into a Thunk
        this.sui.GetKmapFromID(id, (kmap) => {
            console.dir(kmap);
            if (!this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state = {kmap: kmap};
                // this.sui.pages.Draw(this.state.kmap, true);
                this.sui.GetChildDataFromID(id, (kmapchild) => {
                    if (!this.state || !this.state.kmapchild || kmapchild.uid && kmapchild.uid !== this.state.kmapchild.uid) {
                        this.state = {kmap:kmap, kmapchild: kmapchild};
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
            console.log("kmappungley: ", this.props.kmap);
            console.log("suiwhuiblui: ", this.sui.assets);

            output =
                <div className={'termsviewer'}>
                    <div className={"sui-terms"}>
                        <span className="shanticon-terms"></span>
                        &nbsp;&nbsp;&nbsp;
                        <span className="sui-termTitle"
                              id="sui-termTitle">{this.props.kmap.name_tibt}&nbsp;&nbsp;&nbsp;{this.props.kmap.name_latin[0]}</span>
                        <hr style={{"borderTop": '1px solid rgb(162, 115, 63)'}}/>

                        <TermNames kmapchild={ this.props.kmapchild }/>
                        <TermAudioPlayer kmapchild={ this.props.kmapchild } />
                        <Definitions kmapchild={ this.props.kmapchild } />
                    </div>
                </div>;
        }


        if (!this.state.id.match(/^terms-\d+/)) {
            return ERROR;
        } else {
            return output;
        }

        function TermNames(props) {

            // filter names out of the child docs
            const names =  _.filter(props.kmapchild._childDocuments_, (x) => { return x.block_child_type.match(/name/); });
            return <pre>Term Names: {JSON.stringify( names, undefined, 3)}</pre>


            function buildNestedDocs(docs, pathField) {
                const base = {};
                docs = _.sortBy(docs, (x)=>[ pathField ]);

                _.forEach(docs, (doc) => {
                    const path = doc[pathField].split('/');
                    if (path.length = 1) {
                        // this is a "root doc", push it on the base list
                        base[path[0]] = doc;
                    } else {
                        // this is a "nested doc"

                        // check for each "ancestor"
                        // create  "fake ancestor", if it doesn't exist
                        // add the doc to its parent in _nestedDoc_ field
                        //      created _nestedDoc_ field if it doesn't exist
                        //      if it already exists (it might have been faked earlier), populate fields

                    }




                })





            }
        }

        function TermAudioPlayer(props) {

            const audioRefs =  _.filter(props.kmapchild._childDocuments_, (x) => { return x.block_child_type === "terms_recording" });
            return <pre>Audio: {JSON.stringify(audioRefs, undefined, 3)}</pre>
        }

        function Definitions (props) {

            const definitions =  _.filter(props.kmapchild._childDocuments_, (x) => { return x.block_child_type.match(/definition/) });
            return <pre>Definitions: {JSON.stringify(definitions, undefined, 3)}</pre>
        }

    }
}

export default withRouter(TermsViewer);