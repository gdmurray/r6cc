import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import LoginComponent from "../components/LoginComponent";
import {loginUser} from "../actions/auth";

const Login = (props) => {
    if(props.isAuthenticated){
        return (
            <Redirect to="/"/>
        )
    }else{
        return (
            <div className="login-page">
                <LoginComponent {...props}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    isLoggingIn: state.auth.isLoggingIn,
    loginError: state.auth.loginError,
    isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = (dispatch) => ({
    onSubmit: (email, password) => {
        dispatch(loginUser(email, password))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Login);