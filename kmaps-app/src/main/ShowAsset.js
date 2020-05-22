import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {AudioVideoViewer} from "../views/AudioVideoViewer";
import {ImagesViewer} from "../views/ImagesViewer";
import {TextsViewer} from "../views/TextsViewer";
import {SourcesViewer} from "../views/SourcesViewer";
import {VisualsViewer} from "../views/VisualsViewer";
import {PlacesViewer} from "../views/PlacesViewer";
import {SubjectsViewer} from "../views/SubjectsViewer";
import {RelatedsViewer} from "../views/RelatedsViewer";
import {LegacyViewer} from "../views/LegacyViewer";
import {TermsViewer} from "../views/TermsViewer";
import {CollectionsViewer} from "../views/CollectionsViewer";
import {Error404} from "../App";

export class AssetViewer extends React.PureComponent {

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

    render() {
        return <Router>
            <Switch>
                // I don't understand why you need to do this
                <Route path="/view/:asset/:id"
                       component={props => <ShowAsset sui={this.props.sui} kmap={this.props.kmap} match={props.match}
                                                      onStateChange={this.handleStateChange}/>}/>
                <Route path="/view/:asset">
                    <ShowAsset sui={this.props.sui} kmap={this.props.kmap} kmapchild={this.props.kmapchild}
                               onStateChange={this.props.onStateChange}/>
                </Route>
                <Route path={"*"}>
                    <h2>Unknown params</h2>
                </Route>
            </Switch>
        </Router>
    }
}

export class ShowAsset extends React.Component {

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
        const kmapchild = this.props.kmapchild;
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
                <Route path="/view/assets/:id">
                    <RelatedsViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                    <LegacyViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path={"/view/terms/:id"}>
                    <TermsViewer id={id} kmap={kmap} kmapchild={kmapchild} sui={sui}
                                 onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="/view/collections/:id">
                    <CollectionsViewer id={id} sui={sui} onStateChange={this.handleStateChange}/>
                </Route>
                <Route path="*">
                    <Error404/>
                </Route>
            </Switch>
        </Router>
    }
}