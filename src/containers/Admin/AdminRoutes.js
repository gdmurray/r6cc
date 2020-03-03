import React from "react";
import Navigation from "../Navigation";
import {Route} from "react-router";
import {MapList} from "../Maps";
import AdminHome from "./AdminHome";
import MapEditor from "../Editor/MapEditor";
//import MapViewer from "./Viewer/MapViewer";

const AdminRoutes = (props) => {
    return (
        <div className="app-content">
            <Navigation />
            <div className="inner-content">
                <Route exact path={`${props.match.path}`} component={AdminHome} />
                <Route exact path={`${props.match.path}/maps`} component={() => <MapList admin={true} />}/>
                <Route exact path={`${props.match.path}/maps/:map`} component={MapEditor}/>
            </div>
        </div>
    )
}

export default AdminRoutes;