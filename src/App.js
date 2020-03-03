import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Switch } from 'react-router'
import Home from "./containers/Home";
import Login from "./containers/Login";
import { ROUTES } from "./constants";
import PrivateRoute from "./containers/PrivateRoute";
import {AdminRoutes} from "./containers/Admin";
import {MapsRoutes} from "./containers/Maps/";
import 'semantic-ui-css/semantic.min.css'

function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path={ROUTES.MAPLIST} component={MapsRoutes} />
        <Route path={ROUTES.LOGIN} component={Login} />
        <PrivateRoute path={ROUTES.ADMIN} component={AdminRoutes} />
      </Switch>
    </div>
    
  )
}

export default App;
