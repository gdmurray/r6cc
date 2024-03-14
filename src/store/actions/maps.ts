import { mapsRef, mapWithId, handleFirebaseErrors } from "../../firebase";

let _sortBy = require("lodash/sortBy");

export const GET_MAP_LIST_REQUEST = "@@maps/GET_MAP_LIST_REQUEST";
export const GET_MAP_LIST_SUCCESS = "@@maps/GET_MAP_LIST_SUCCESS";
export const GET_MAP_LIST_FAILURE = "@@maps/GET_MAP_LIST_FAILURE";

export const UPDATE_MAP_REQUEST = "@@maps/UPDATE_MAP_REQUEST";
export const UPDATE_MAP_SUCCESS = "@@maps/UPDATE_MAP_SUCCESS";
export const UPDATE_MAP_FAILURE = "@@maps/UPDATE_MAP_FAILURE";

export const requestMapList = () => ({
    type: GET_MAP_LIST_SUCCESS,
});

export const receiveMapList = (maps) => ({
    type: GET_MAP_LIST_SUCCESS,
    maps,
});

export const mapListError = (error) => ({
    type: GET_MAP_LIST_FAILURE,
    error,
});

export const getMapList = () => (dispatch) => {
    console.log("GET MAP LIST ACTION");
    dispatch(requestMapList());
    mapsRef
        .get()
        .then((maps) => {
            let mapData = mapWithId(maps);
            mapData = _sortBy(mapData, [(a) => a.name]);
            dispatch(receiveMapList(mapData));
        })
        .catch((error) => {
            const { name, code, message } = error;
            let errorObj = { name, code, message };
            console.log(errorObj);
            dispatch(mapListError(error));
            dispatch(handleFirebaseErrors(error));
        });
};

export const requestMapUpdate = () => {
    return {
        type: UPDATE_MAP_REQUEST,
    };
};

export const mapUpdateSuccess = (map) => {
    return {
        type: UPDATE_MAP_SUCCESS,
        payload: map,
    };
};

export const mapUpdateFailure = (error) => {
    return {
        type: UPDATE_MAP_FAILURE,
        payload: error,
    };
};

export const updateMap = (map) => (dispatch) => {
    dispatch(requestMapUpdate());
    mapsRef
        .doc(map.id)
        .update({
            focal: map.focal,
        })
        .then((docRef) => {
            console.log(docRef);
            mapUpdateSuccess(docRef);
        })
        .catch((error) => {
            mapUpdateFailure(error);
        });
};
