import React, {Component} from "react";
import Navigation from "../Navigation";
import {Route} from "react-router";
import MapList from "./MapList";
import MapViewer from "../Viewer/MapViewer";

const MapsRoutes = (props) => {
    return (
        <div className="app-content">
            <Navigation />
            <div className="inner-content">
                <Route exact path={`${props.match.path}`} component={MapList}/>
                <Route exact path={`${props.match.path}/:map`} component={MapViewer}/>
            </div>
        </div>
    )
}

export default MapsRoutes;


