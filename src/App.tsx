import React from "react";
import "./App.css";
import { Route, Switch } from "react-router";
import "semantic-ui-css/semantic.min.css";
import EditorContainer from "./pages/Editor/EditorContainer";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import ViewerContainer from "./pages/Viewer/ViewerContainer";
import Maps from "./pages/Maps/Maps";

function App() {
    return (
        <div>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/map/:map" component={ViewerContainer} />
                <Route exact path="/maps" component={Maps} />
                <Route path="/login" component={Login} />
                <Route path="/editor/:map" component={EditorContainer} />
            </Switch>
        </div>
    );
}

export default App;
