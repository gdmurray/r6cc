import { calloutsRef, mapWithId, database } from "../firebase";
import {verifyAuth} from "./auth";
let _sortBy = require("lodash/sortBy");

export const GET_CALLOUTS_REQUEST = '@@callouts/GET_CALLOUTS_REQUEST';
export const GET_CALLOUTS_SUCCESS = '@@callouts/GET_CALLOUTS_SUCCESS';
export const GET_CALLOUTS_FAILURE = '@@callouts/GET_CALLOUTS_FAILURE';

export const INSERT_CALLOUTS_REQUEST = '@@callouts/INSERT_CALLOUTS_REQUEST';
export const INSERT_CALLOUTS_SUCCESS = '@@callouts/INSERT_CALLOUTS_SUCCESS';
export const INSERT_CALLOUTS_FAILURE = '@@callouts/INSERT_CALLOUTS_FAILURE';

export const UPDATE_CALLOUTS_REQUEST = '@@callouts/UPDATE_CALLOUTS_REQUEST';
export const UPDATE_CALLOUTS_SUCCESS = '@@callouts/UPDATE_CALLOUTS_SUCCESS';
export const UPDATE_CALLOUTS_FAILURE = '@@callouts/UPDATE_CALLOUTS_FAILURE';

export const DELETE_CALLOUT_REQUEST = '@@callouts/DELETE_CALLOUT_REQUEST';
export const DELETE_CALLOUT_SUCCESS = '@@callouts/DELETE_CALLOUT_SUCCESS';
export const DELETE_CALLOUT_FAILURE = '@@callouts/DELETE_CALLOUT_FAILURE';

export const requestCallouts = () => ({
    type: GET_CALLOUTS_REQUEST
})

export const receiveCallouts = callouts => ({
    type: GET_CALLOUTS_SUCCESS,
    callouts
})

export const getCalloutsFailure = error => ({
    type: GET_CALLOUTS_FAILURE,
    error
})

export const getCallouts = (map, floor) => dispatch => {
    dispatch(requestCallouts());
    calloutsRef
        .where("map", "==", map)
        .where("floor", "==", floor)
        .get()
            .then(callouts => {
                dispatch(receiveCallouts(mapWithId(callouts)))
            })
            .catch(error => {
                dispatch(getCalloutsFailure(error));
            })
}

export const requestInsertCallouts = () => ({
    type: INSERT_CALLOUTS_REQUEST
})

export const receiveInsertCallouts = () => ({
    type: INSERT_CALLOUTS_SUCCESS
})

export const insertCalloutsFailure = error => ({
    type: INSERT_CALLOUTS_FAILURE,
    error
})

export const insertCallouts = (callouts) => dispatch => {
    dispatch(requestInsertCallouts())
    let batch = database.batch()
    for(var callout of callouts){
        var calloutsDocRef = calloutsRef.doc()
        batch.set(calloutsDocRef, callout)
    }
    batch
        .commit()
        .then(success => {
            dispatch(receiveInsertCallouts())
        })
        .catch(error => {
            dispatch(insertCalloutsFailure(error))
        })
}

export const requestUpdateCallouts = () => ({
    type: UPDATE_CALLOUTS_REQUEST
})

export const receiveUpdateCallouts = () => ({
    type: UPDATE_CALLOUTS_SUCCESS
})

export const updateCalloutsFailure = error => ({
    type: UPDATE_CALLOUTS_FAILURE,
    error
})

export const updateCallouts = (callouts) => dispatch => {
    dispatch(requestUpdateCallouts())
    let batch = database.batch()
    for(var callout of callouts){
        var calRef = calloutsRef.doc(callout.id);
        batch.update(calRef, callout)
    }
    batch
        .commit()
        .then(success => {
            dispatch(receiveUpdateCallouts())
        })
        .catch(error => {
            dispatch(updateCalloutsFailure(error))
        })
}

export const requestDeleteCallout = () => ({
    type: DELETE_CALLOUT_REQUEST
})

export const receiveDeleteCallout = () => ({
    type: DELETE_CALLOUT_SUCCESS
})

export const deleteCalloutFailure = error => ({
    type: DELETE_CALLOUT_FAILURE,
    error
})

export const deleteCallout = (calloutId) => dispatch => {
    dispatch(requestDeleteCallout());
    calloutsRef.doc(calloutId)
        .delete()
        .then(success => {
            dispatch(receiveDeleteCallout())
        })
        .catch(error => {
            dispatch(deleteCalloutFailure(error))
        })
}