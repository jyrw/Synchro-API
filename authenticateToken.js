import admin from "firebase-admin"; // import * as admin from "firebase-admin"; // In docs but doesn't work? // TODO: Check if this is ok
import serviceAccount from "./serviceAccount.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Application level middleware to authenticate HTTP requests
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