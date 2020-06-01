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

        console.error("Trying to get get kmap from id: id = " + id);
        this.sui.GetKmapFromID(id, (kmasset) => {
            if (!this.state || !this.state.kmasset || kmasset.uid && kmasset.uid !== this.state.kmasset.uid) {
                this.state = {kmasset: kmasset};
                this.sui.GetChildDataFromID(id, (kmap) => {
                    if (!this.state || !this.state.kmap || kmap.uid && kmap.uid !== this.state.kmap.uid) {
                        this.state = {kmasset: kmasset, kmap: kmap};
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


        console.log("TermsViewer: Render(): props = ", this.props);

        if (this.props.kmasset && this.props.kmasset.asset_type) {
            output =
                <div className={'termsviewer'}>
                    <div className={"sui-terms"}>
                        <NodeHeader kmasset={this.props.kmasset}/>
                        <TermNames kmap={this.props.kmap}/>
                        <TermAudioPlayer kmap={this.props.kmap}/>
                        <Definitions kmap={this.props.kmap}/>
                        <RelatedTerms kmap={this.props.kmap}/>
                    </div>
                    {/*<pre>{JSON.stringify(this.props.kmap, undefined, 2)}</pre>*/}
                </div>;
        }

        return output;
    }
}

// We're wrapping this in in the "withRouter" HOC in order to ease use of the Router in a Class-based Component
// Once we start using Redux to pass all the props to TermsViewer we should be able to convert this to
// a function-based component and start using the useRouter hook instead.
export default withRouter(TermsViewer);