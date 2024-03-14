import React from "react";
import ReactDOM from "react-dom";

import { PersistGate } from "redux-persist/lib/integration/react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";
import { createFirestoreInstance } from "redux-firestore";
import * as serviceWorker from "./serviceWorker";
import App from "./App";

import firebaseApp from "./firebase";
import configureStore, { history } from "./store/store";

import "antd/dist/antd.css";
import "./index.css";

const { store, persistor } = configureStore(history);

const rrfConfig = {
    userProfile: "users",
    useFirestoreForProfile: true,
    attachAuthIsReady: true,
};

const rrfProps = {
    firebase: firebaseApp,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance,
};

ReactDOM.render(
    <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
            <PersistGate loading={<div>Loading</div>} persistor={persistor}>
                <ConnectedRouter history={history}>
                    <App />
                </ConnectedRouter>
            </PersistGate>
        </ReactReduxFirebaseProvider>
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
