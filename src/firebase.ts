import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { push } from "connected-react-router";
import { logoutUser } from "./store/actions/auth";

export const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};
export const firebaseApp = firebase.initializeApp(config);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
export const database = firebase.firestore();
export const mapsRef = database.collection("maps");
export const calloutsRef = database.collection("callouts");
export const firebaseStorage = firebase.storage();
// export const mapsRef = databaseRef.child("maps");
// export const authRef = firebase.auth();

export function mapWithId(objects) {
    return objects.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export const handleFirebaseErrors = (errorObject) => (dispatch) => {
    const { code } = errorObject;
    switch (code) {
        case "permission-denied":
            dispatch(logoutUser());
            push("/login");
            break;
        default:
            break;
    }
};

export default firebaseApp;
