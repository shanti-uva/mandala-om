import React from "react";
import {BrowserRouter as Router, Route, Switch, useParams} from "react-router-dom";
import {AudioVideoViewer} from "../views/AudioVideoViewer";
import {ImagesViewer} from "../views/ImagesViewer";
import {TextsViewer} from "../views/TextsViewer";
import {SourcesViewer} from "../views/SourcesViewer";
import {VisualsViewer} from "../views/VisualsViewer";
import {PlacesViewer} from "../views/PlacesViewer";
import {SubjectsViewer} from "../views/SubjectsViewer";
import {RelatedsViewer} from "../views/RelatedsViewer";
import LegacyViewer from "../views/LegacyViewer";
import TermsViewer from "../views/TermsViewer";
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
        return <Switch>
            <Route path="/view/:asset/:id">
                <ShowAsset sui={this.props.sui} kmasset={this.props.kmasset}
                           onStateChange={this.handleStateChange}/>
            </Route>
            <Route path="/view/:asset">
                <ShowAsset sui={this.props.sui} kmasset={this.props.kmasset} kmterm={this.props.kmterm}
                           onStateChange={this.props.onStateChange}/>
            </Route>
            <Route path={"*"}>
                <h2>Unknown params</h2>
            </Route>
        </Switch>
    }
}

export function ShowAsset(props) {
    const {id} = useParams();
    console.log("ShowAsset: id = " + id);

    const sui = props.sui;
    const kmasset = props.kmasset;
    const kmterm = props.kmterm;
    if (!sui) {
        throw new Error("This is no sui!")
    }

    return <Switch>
        <Route path="/view/audio-video/:id">
            <AudioVideoViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/images/:id">
            <ImagesViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/texts/:id">
            <TextsViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/sources/:id">
            <SourcesViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/visuals/:id">
            <VisualsViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/places/:id">
            <PlacesViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/subjects/:id">
            <SubjectsViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="/view/assets/:id">
            <RelatedsViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
            <LegacyViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path={"/view/terms/:id"}>
            <TermsViewer kmasset={kmasset} kmterm={kmterm} sui={sui} onStateChange={props.onStateChange}  />
        </Route>
        <Route path="/view/collections/:id">
            <CollectionsViewer id={id} sui={sui} onStateChange={props.onStateChange}/>
        </Route>
        <Route path="*">
            <Error404/>
        </Route>
    </Switch>
}