import { firebaseApp } from "../../firebase";

export const BEGIN_API_CALL = "@@auth/BEGIN_API_CALL";
export const API_CALL_ERROR = "@@auth/API_CALL_ERROR";

export const LOGIN_SUCCESS = "@@auth/LOGIN_SUCCESS";
export const LOGIN_FAILURE = "@@auth/LOGIN_FAILURE";

export const LOGOUT_SUCCESS = "@@auth/LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "@@auth/LOGOUT_FAILURE";

export const RESET_SUCCESS = "@@auth/RESET_SUCCESS";
export const RESET_FAILURE = "@@auth/RESET_FAILURE";

export const beginApiCall = () => {
    return {
        type: BEGIN_API_CALL,
    };
};

export const apiCallError = () => {
    return {
        type: API_CALL_ERROR,
    };
};

export const loginError = (error) => {
    return {
        type: LOGIN_FAILURE,
        error,
    };
};

export const loginSuccess = (user) => {
    return {
        type: LOGIN_SUCCESS,
        user,
    };
};

export const loginUser = (email, password) => (dispatch) => {
    dispatch(beginApiCall());
    firebaseApp
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
            if (user.user) {
                if (user.user.emailVerified) {
                    dispatch(loginSuccess(user));
                } else {
                    dispatch(
                        loginError({
                            code: "auth/email-verification",
                            message: "Email address not yet verified",
                        })
                    );
                }
            }
        })
        .catch((error) => {
            console.log(error);
            dispatch(apiCallError());
            dispatch(loginError(error));
        });
};

/*
    Logout Functions
*/

export const logoutSuccess = () => {
    return {
        type: LOGOUT_SUCCESS,
    };
};

export const logoutError = (error) => {
    return {
        type: LOGOUT_FAILURE,
        error,
    };
};

export const purgeUserInfo = () => {
    return {
        type: "PURGE",
        key: "root",
    };
};

export const logoutUser = () => (dispatch) => {
    dispatch(beginApiCall());
    firebaseApp
        .auth()
        .signOut()
        .then(() => {
            dispatch(logoutSuccess());
            dispatch(purgeUserInfo());
        })
        .catch((error) => {
            //Do something with the error if you want!
            dispatch(apiCallError());
            dispatch(logoutError(error));
        });
};

export const resetSuccess = () => {
    return {
        type: RESET_SUCCESS,
    };
};

export const resetFailure = (error) => {
    return {
        type: RESET_FAILURE,
        payload: error,
    };
};
export const resetPassword = (email) => async (dispatch) => {
    try {
        dispatch(beginApiCall());
        firebaseApp
            .auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                dispatch(resetSuccess());
            })
            .catch((error) => {
                dispatch(apiCallError());
                dispatch(resetFailure(error));
            });
    } catch (err) {
        dispatch(apiCallError());
        dispatch(resetFailure(err));
    }
};
