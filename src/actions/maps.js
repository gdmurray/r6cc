import { mapsRef, mapWithId, handleFirebaseErrors} from "../firebase";
let _sortBy = require('lodash.sortby');

export const GET_MAP_LIST_REQUEST = '@@maps/GET_MAP_LIST_REQUEST';
export const GET_MAP_LIST_SUCCESS = '@@maps/GET_MAP_LIST_SUCCESS';
export const GET_MAP_LIST_FAILURE = '@@maps/GET_MAP_LIST_FAILURE';

//export const GET_MAP_INFO_REQUEST = "@@maps/GET_MAP_INFO_REQUEST";
//export const GET_MAP_INFO_SUCCESS = '@@maps/GET_MAP_INFO_SUCCESS';
//export const GET_MAP_INFO_FAILURE = '@@maps/GET_MAP_INFO_FAILURE';

export const requestMapList = () => ({
    type: GET_MAP_LIST_SUCCESS
})

export const receiveMapList = maps => ({
    type: GET_MAP_LIST_SUCCESS,
    maps
})

export const mapListError = error => ({
    type: GET_MAP_LIST_FAILURE,
    error
})

export const getMapList = () => dispatch => {
    dispatch(requestMapList());
    mapsRef
        .get()
        .then(maps => {
            var mapData = mapWithId(maps);
            mapData = _sortBy(mapData, [a => a.name]);
            dispatch(receiveMapList(mapData))
        })
        .catch(error => {
            const { name, code, message } = error;
            let errorObj = { name, code, message }
            console.log(errorObj);
            dispatch(mapListError());
            dispatch(handleFirebaseErrors(error));
        });
}

