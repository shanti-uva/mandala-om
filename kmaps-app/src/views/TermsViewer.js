import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import Definitions from './TermsViewer_Definitions';
import TermNames from "./TermsViewer_Names";
import TermAudioPlayer from "./TermsViewer_AudioPlayer";
import RelatedTerms from "./TermsViewer_RelatedTerms";

import {buildNestedDocs} from "./common/utils";
import NodeHeader from "./common/NodeHeader";

// Bootstrap

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

        const id = this.props.id || this.props.match.params.id;
        if (id) {
            this.state = {id: id};
        }

        // TODO: refactor into a Thunk
        this.sui.GetKmapFromID(id, (kmap) => {
            if (!this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                this.state = {kmap: kmap};
                this.sui.GetChildDataFromID(id, (kmapchild) => {
                    if (!this.state || !this.state.kmapchild || kmapchild.uid && kmapchild.uid !== this.state.kmapchild.uid) {
                        this.state = {kmap: kmap, kmapchild: kmapchild};
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
        // console.log("TermsViewer:componentDidMount");
    }

    render() {
        // console.error("TermsViewer render", this.props);

        // This is isn't being used at the moment
        const ERROR = <div className={'termsviewer'}>
            <div class={"sui-terms"}>
                <div>ERRORINESS</div>
                <div id={'sui-terms'}>id must be a term uid. Try this instead: <Link
                    to={"/view/assets/" + this.state.id}>/view/assets/{this.state.id}</Link></div>
                <div>PLAGNY</div>
            </div>
        </div>;

        let output = <div className={'termsviewer'}>
            Loading...
        </div>;

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

        return output;
    }
}

// We're wrapping this in in the "withRouter" HOC in order to ease use of the Router in a Class-based Component
// Once we start using Redux to pass all the props to TermsViewer we should be able to convert this to
// a function-based component and start using the useRouter hook instead.
export default withRouter(TermsViewer);