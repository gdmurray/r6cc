import {
    GET_MAP_LIST_REQUEST,
    GET_MAP_LIST_SUCCESS,
    GET_MAP_LIST_FAILURE
} from "../actions/maps";

const initialState = {
    loadingMaps: false,
    mapList: null,
    mapsError: false
}

export default (state = initialState, action) => {
    switch(action.type){
        case GET_MAP_LIST_REQUEST:
            return {
                ...state,
                loadingMaps: true
            }
        case GET_MAP_LIST_SUCCESS:
            return {
                ...state,
                mapList: action.maps,
                loadingMaps: false
            }
        case GET_MAP_LIST_FAILURE:
            return {
                ...state,
                mapsError: action.error,
                loadingMaps: false
            }
        default:
            return state
    }
}