import * as callouts from "../actions/callouts";

const initialState = {
    loading: false,
    callouts: [],
    getCalloutsError: false,

    inserting: false,
    insertCalloutsError: false,

    updating: false,
    updateCalloutsError: false,

    deleting: false,
    deleteCalloutError: false
}

export default(state = initialState, action) => {
    switch(action.type){
        case callouts.GET_CALLOUTS_REQUEST:
            return {
                ...state,
                loading: true
            }
        
        case callouts.GET_CALLOUTS_SUCCESS:
            return {
                ...state,
                loading: false,
                getCalloutsError: false,
                callouts: action.callouts
            }
        
        case callouts.GET_CALLOUTS_FAILURE:
            return {
                ...state,
                loading: false,
                getCalloutsError: action.error
            }
        
        case callouts.INSERT_CALLOUTS_REQUEST:
            return {
                ...state,
                inserting: true
            }

        case callouts.INSERT_CALLOUTS_SUCCESS:
            return {
                ...state,
                inserting: false,
                insertCalloutsError: false,
            }
        
        case callouts.INSERT_CALLOUTS_FAILURE:
            return {
                ...state,
                inserting: false,
                insertCalloutsError: action.error
            }
        
        case callouts.UPDATE_CALLOUTS_REQUEST:
            return {
                ...state,
                updating: true
            }

        case callouts.UPDATE_CALLOUTS_SUCCESS:
            return {
                ...state,
                updating: false,
                updateCalloutsError: false
            }
        
        case callouts.UPDATE_CALLOUTS_FAILURE:
            return {
                ...state,
                updating: false,
                updateCalloutsError: action.error
            }
        
        case callouts.DELETE_CALLOUT_REQUEST:
            return {
                ...state,
                deleting: true,
            }
        
        case callouts.DELETE_CALLOUT_SUCCESS:
            return {
                ...state,
                deleting: false,
                deleteCalloutError: false
            }
        
        case callouts.DELETE_CALLOUT_FAILURE:
            return {
                ...state,
                deleting: false,
                deleteCalloutError: action.error
            }
        default:
            return state
    }
}