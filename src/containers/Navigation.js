import React from "react";
import { connect } from 'react-redux'
import NavComponent from "../components/NavComponent";
import { push } from 'connected-react-router'
import {isAuthenticated} from "../reducers";
import {logoutUser} from "../actions/auth";

const Navigation = (props) => {
    return (<NavComponent {...props} />)
}

const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state)
})

const mapDispatchToProps = (dispatch) => ({
    goToRoute: (route) => {
        dispatch(push(route))
    },
    logout: () => {
        dispatch(logoutUser());
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);