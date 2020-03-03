import {firebaseApp} from "../firebase";

export const LOGIN_REQUEST = '@@auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = '@@auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = '@@auth/LOGIN_FAILURE';

export const REGISTER_USER_REQUEST = '@@auth/REGISTER_USER_REQUEST';
export const REGISTER_USER_SUCCESS = '@@auth/REGISTER_USER_SUCCESS';
export const REGISTER_USER_FAILURE = '@@auth/REGISTER_USER_FAILURE';

//export const TOKEN_REQUEST = '@@auth/TOKEN_REQUEST';
//export const TOKEN_RECEIVED = '@@auth/TOKEN_RECEIVED';
//export const TOKEN_FAILURE = '@@auth/TOKEN_FAILURE'

export const LOGOUT_REQUEST = "@@auth/LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "@@auth/LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "@@auth/LOGOUT_FAILURE";

export const VERIFY_REQUEST = "@@auth/VERIFY_REQUEST";
export const VERIFY_SUCCESS = "@@auth/VERIFY_SUCCESS";

/*
    Login Functions
    requestLogin -> Action which starts login process
    loginError -> If api throws error, return it in payload
    receiveLogin -> API Success, return user payload
*/
export const requestLogin = () => {
    return {
        type: LOGIN_REQUEST
    }
}

export const loginError = error => {
    return {
        type: LOGIN_FAILURE,
        error
    }
}

export const receiveLogin = user => {
    return {
        type: LOGIN_SUCCESS,
        user
    }
}

export const loginUser = (email, password) => dispatch => {
    dispatch(requestLogin());
    firebaseApp
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(user => {
            console.log("SUCCESS RECEIVED");
            dispatch(receiveLogin(user))
        })
        .catch(error => {
            console.log("ERROR RECEIVED");
            dispatch(loginError(error))
        })
}

/*
    Logout Functions
*/
export const requestLogout = () => {
    return {
        type: LOGOUT_REQUEST
    }
}

export const receiveLogout = () => {
    return {
        type: LOGOUT_SUCCESS
    }
}

export const logoutError = error => {
    return {
        type: LOGOUT_FAILURE,
        error
    }
}

export const purgeUserInfo = () => {
    return {
        type: 'PURGE',
        key: 'root'
    }
}

export const logoutUser = () => dispatch => {
    dispatch(requestLogout());
    firebaseApp
      .auth()
      .signOut()
      .then(() => {
        dispatch(receiveLogout());
        dispatch(purgeUserInfo());
      })
      .catch(error => {
        //Do something with the error if you want!
        dispatch(logoutError(error));
      });
  };

const verifyRequest = () => {
    return {
      type: VERIFY_REQUEST
    };
  };
  
  const verifySuccess = () => {
    return {
      type: VERIFY_SUCCESS
    };
  };
  

export const verifyAuth = () => dispatch => {
    dispatch(verifyRequest());
    firebaseApp
      .auth()
      .onAuthStateChanged(user => {
        if (user !== null) {
          dispatch(receiveLogin(user));
        }
        dispatch(verifySuccess());
      });
  };