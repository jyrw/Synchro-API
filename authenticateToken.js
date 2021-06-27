import admin from "firebase-admin"; // import * as admin from "firebase-admin"; // In docs but doesn't work? // TODO: Check if this is ok
import serviceAccount from "./serviceAccount.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    /*
    Not needed?
    "Note: Initialization options such as databaseURL shown in the code examples on this page are not strictly required to initialize the SDK. 
    Depending on your deployment environment and the target use case, you can choose to specify only the options you need."
    */
    // databaseURL: "https://Synchro-Auth-Development.firebaseio.com" // Wrong URL. 
});

async function decodeIDToken(req, res, next) {
    const header = req.headers?.authorization; // Optional chaining
    if (header !== 'Bearer null' && req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1]; // Split into 2 substrings, return the 2nd
        
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.currentUser = decodedToken;
        } catch (err) {
            console.log(err);
        }
    }
    next(); // https://https://stackoverflow.com/questions/5384526/javascript-node-js-next
}
export default decodeIDToken;
