import { calloutsRef, mapWithId, database } from "../../firebase";

export const GET_CALLOUTS_REQUEST = "@@callouts/GET_CALLOUTS_REQUEST";
export const GET_CALLOUTS_SUCCESS = "@@callouts/GET_CALLOUTS_SUCCESS";
export const GET_CALLOUTS_FAILURE = "@@callouts/GET_CALLOUTS_FAILURE";

export const INSERT_CALLOUTS_REQUEST = "@@callouts/INSERT_CALLOUTS_REQUEST";
export const INSERT_CALLOUTS_SUCCESS = "@@callouts/INSERT_CALLOUTS_SUCCESS";
export const INSERT_CALLOUTS_FAILURE = "@@callouts/INSERT_CALLOUTS_FAILURE";

export const UPDATE_CALLOUTS_REQUEST = "@@callouts/UPDATE_CALLOUTS_REQUEST";
export const UPDATE_CALLOUTS_SUCCESS = "@@callouts/UPDATE_CALLOUTS_SUCCESS";
export const UPDATE_CALLOUTS_FAILURE = "@@callouts/UPDATE_CALLOUTS_FAILURE";

export const DELETE_CALLOUT_REQUEST = "@@callouts/DELETE_CALLOUT_REQUEST";
export const DELETE_CALLOUT_SUCCESS = "@@callouts/DELETE_CALLOUT_SUCCESS";
export const DELETE_CALLOUT_FAILURE = "@@callouts/DELETE_CALLOUT_FAILURE";

export const clearCallouts = () => (dispatch) => {
    dispatch(clearCallouts());
};
export const requestCallouts = () => ({
    type: GET_CALLOUTS_REQUEST,
});

export const receiveCallouts = (callouts) => ({
    type: GET_CALLOUTS_SUCCESS,
    callouts,
});

export const getCalloutsFailure = (error) => ({
    type: GET_CALLOUTS_FAILURE,
    error,
});

export const getCallouts = (map, floor) => (dispatch) => {
    dispatch(requestCallouts());
    calloutsRef
        .where("map", "==", map)
        .where("floor", "==", floor)
        .get()
        .then((callouts) => {
            dispatch(receiveCallouts(mapWithId(callouts)));
        })
        .catch((error) => {
            dispatch(getCalloutsFailure(error));
        });
};

export const requestInsertCallouts = () => ({
    type: INSERT_CALLOUTS_REQUEST,
});

export const receiveInsertCallouts = (insertionMap) => ({
    type: INSERT_CALLOUTS_SUCCESS,
    payload: insertionMap,
});

export const insertCalloutsFailure = (error) => ({
    type: INSERT_CALLOUTS_FAILURE,
    error,
});

export const insertCallouts = (callouts) => (dispatch) => {
    dispatch(requestInsertCallouts());
    const insertCallout = async (callout, resolve, reject) => {
        const calloutObj = { ...callout };
        const tmpId = callout.id;
        delete calloutObj.id;
        calloutsRef
            .add({ ...calloutObj })
            .then((docRef) => {
                resolve({ [tmpId]: docRef.id });
            })
            .catch((error) => {
                reject(error);
            });
    };
    let insertions = callouts.map((callout) => {
        return new Promise((resolve, reject) => {
            insertCallout(callout, resolve, reject).finally(() => {});
        });
    });
    Promise.all(insertions)
        .then((result) => {
            console.log(result);
            const idMap = result.reduce((r, c) => Object.assign(r, c), {});
            console.log(idMap);
            dispatch(receiveInsertCallouts(idMap));
        })
        .catch((error) => {
            console.log(error);
            dispatch(insertCalloutsFailure(error));
        });
};

export const requestUpdateCallouts = () => ({
    type: UPDATE_CALLOUTS_REQUEST,
});

export const receiveUpdateCallouts = () => ({
    type: UPDATE_CALLOUTS_SUCCESS,
});

export const updateCalloutsFailure = (error) => ({
    type: UPDATE_CALLOUTS_FAILURE,
    error,
});

export const updateCallouts = (callouts) => (dispatch) => {
    dispatch(requestUpdateCallouts());
    let batch = database.batch();
    for (let callout of callouts) {
        console.log("UPDATE:", callout);
        const calRef = calloutsRef.doc(callout.id);
        const data = {
            callout: callout.callout,
            callout_alt: callout.callout_alt,
            order: callout.order === undefined ? 0 : callout.order,
            "shape.type": callout.shape.type,
            "shape.values": callout.shape.values,
        };
        batch.update(calRef, data);
    }
    batch
        .commit()
        .then(() => {
            dispatch(receiveUpdateCallouts());
        })
        .catch((error) => {
            console.log("ERROR IN UPDATE: ", error);
            dispatch(updateCalloutsFailure(error));
        });
};

export const requestDeleteCallout = () => ({
    type: DELETE_CALLOUT_REQUEST,
});

export const receiveDeleteCallout = () => ({
    type: DELETE_CALLOUT_SUCCESS,
});

export const deleteCalloutFailure = (error) => ({
    type: DELETE_CALLOUT_FAILURE,
    error,
});

export const deleteCallout = (calloutId) => (dispatch) => {
    dispatch(requestDeleteCallout());
    calloutsRef
        .doc(calloutId)
        .delete()
        .then(() => {
            dispatch(receiveDeleteCallout());
        })
        .catch((error) => {
            dispatch(deleteCalloutFailure(error));
        });
};
