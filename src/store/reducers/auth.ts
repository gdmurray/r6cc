import {
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE,
    BEGIN_API_CALL,
    RESET_SUCCESS,
    RESET_FAILURE,
} from "../actions/auth";

const initialState = {
    loading: false,
    isAuthenticated: false,
    error: false,

    resetSuccess: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case BEGIN_API_CALL:
            return {
                ...state,
                loading: true,
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
            };

        case LOGIN_FAILURE:
            return {
                ...state,
                isLoggingIn: false,
                isAuthenticated: false,
                error: action.error,
            };

        case LOGOUT_SUCCESS:
            return {
                ...state,
                error: false,
                loading: false,
                isAuthenticated: false,
            };
        case LOGOUT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.error,
            };

        case RESET_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false,
                resetSuccess: true,
            };
        case RESET_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.error,
            };
        default:
            return state;
    }
};
