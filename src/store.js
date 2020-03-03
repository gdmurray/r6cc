import { applyMiddleware, createStore, compose } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import { createFilter   } from 'redux-persist-transform-filter';
import thunkMiddleware from "redux-thunk";
import { routerMiddleware } from 'connected-react-router'
import storage from 'redux-persist/es/storage'

import createRootReducer from './reducers'
import createBrowserHistory from 'history/createBrowserHistory';
import { persistReducer, persistStore } from 'redux-persist'

export const history = createBrowserHistory();

export default function configureStore(preloadedState) {
    const persistedFilter = createFilter(
        'auth', ['user']);

    const rootReducer = persistReducer(
        {
            key: 'root',
            storage: storage,
            whitelist: ['auth'],
            blacklist: ['router'],
            transforms: [persistedFilter]
        },createRootReducer(history)
    )

    const store = createStore(
        rootReducer,
        preloadedState,
        composeWithDevTools(
            applyMiddleware(
                thunkMiddleware,
                routerMiddleware(history)
            )
        )
    )

    const persistor = persistStore(store);
    return { store: store, persistor: persistor }
}