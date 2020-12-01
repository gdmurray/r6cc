import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import localStorage from "redux-persist/lib/storage";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import { persistReducer } from "redux-persist";

import { firebaseReducer } from "react-redux-firebase";
import { firestoreReducer } from "redux-firestore";
import auth from "./auth";
import maps from "./maps";
import callouts from "./callouts";

const mapListPersistConfig = {
    key: "mapList",
    storage: localStorage,
    blacklist: ["mapsError", "loadingMaps"],
};

export default (history) =>
    combineReducers({
        router: connectRouter(history),
        maps: persistReducer(mapListPersistConfig, maps),
        firebase: persistReducer(
            {
                key: "firebaseState",
                storage: localStorage,
                stateReconciler: hardSet,
            },
            firebaseReducer
        ),
        firestore: firestoreReducer,
        auth,
        callouts,
    });
