import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

import auth, * as fromAuth from './auth'
import maps from "./maps";
import callouts from "./callouts";

const mapListPersistConfig = {
    key: 'mapList',
    storage: storage,
    blacklist: ['mapsError', 'loadingMaps']
  }

export default (history) => combineReducers({
    router: connectRouter(history),
    maps: persistReducer(mapListPersistConfig, maps),
    auth,
    callouts
})

export const isAuthenticated = state => fromAuth.isAuthenticated(state.auth)
export const accessToken = state => fromAuth.accessToken(state.auth)
//export const isAccessTokenExpired = state => fromAuth.isAccessTokenExpired(state.auth)
export const refreshToken = state => fromAuth.refreshToken(state.auth)
export const isRefreshTokenExpired = state => fromAuth.isRefreshTokenExpired(state.auth)