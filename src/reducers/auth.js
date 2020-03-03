import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE,
    VERIFY_REQUEST,
    VERIFY_SUCCESS
} from "../actions/auth";

const initialState = {
    isLoggingIn: false,
    isLoggingOut: false,
    isVerifying: false,

    loginError: false,
    logoutError: false,
    verifyingError: false,

    isAuthenticated: false,
    user: {}
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return {
                ...state,
                isLoggingIn: true,
                loginError: false
            }
        case LOGIN_SUCCESS:
            return {
                ...state,
                isLoggingIn: false,
                isAuthenticated: true,
                user: action.user
            }
        case LOGIN_FAILURE:
            return {
                ...state,
                isLoggingIn: false,
                isAuthenticated: false,
                loginError: action.error
            }


        case LOGOUT_REQUEST:
            return {
                ...state,
                isLoggingOut: true,
                logoutError: false
            }
        case LOGOUT_SUCCESS:
            return {
                ...state,
                isLoggingOut: false,
                isAuthenticated: false,
                user: {}
            }
        case LOGOUT_FAILURE:
            return {
                ...state,
                isLoggingOut: false,
                logoutError: action.error
            }


        case VERIFY_REQUEST:
            return {
                ...state,
                isVerifying: true,
                verifyingError: false
            }
        case VERIFY_SUCCESS:
            return {
                ...state,
                isVerifying: false
            }

        default:
            return state
    }
}

export function accessToken(state) {
    if (state.user.user) {
        if (state.user.user.stsTokenManager) {
            return state.user.user.stsTokenManager.accessToken
        }
    }
}

export function refreshToken(state) {
    if (state.user) {
        if (state.user.user) {
            if (state.user.user.stsTokenManager) {
                return state.user.user.stsTokenManager.refreshToken
            }
        }
    }
}

export function expiryTime(state) {
    if (state.user) {
        if (state.user.user) {
            if (state.user.user.stsTokenManager) {
                return state.user.user.stsTokenManager.expirationTime
            }
        }
    }
}

/*
export function isAccessTokenExpired(state) {
    if (accessToken(state) && expiryTime(state)) {
        return 1000 * expiryTime(state) - (new Date()).getTime() < 5000
    }
    return true
}*/

export function isRefreshTokenExpired(state) {
    if (refreshToken(state) && expiryTime(state)) {
        return 1000 * expiryTime(state) - (new Date()).getTime() < 5000
    }
    return true
}

export function isAuthenticated(state) {
    return !isRefreshTokenExpired(state) || state.isAuthenticated
}