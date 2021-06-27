import express from "express";
import User from "../schemas/userSchema.js"

const userRouter = express.Router();

/**
 * Create a new user.
 */
userRouter.post('/users', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const user = new User(req.body);
        const savedUser = user.save();
        return res.status(201).json(savedUser);
    } else {
        return res.status(403).send('Not authorized');
    }
});

/**
 * Get the current user.
 */
userRouter.get('/users', (req, res) => {
    const auth = req.currentUser;
    const uid = auth.uid;
    if (auth) {
        User.find({uid: uid}, (err, user) => {
            return res.json(user.toJSON());
        })
    } else {
        return res.status(403).send('Not authorized');
    }
});

// Add the given projectId to the user's project array.
userRouter.put('/users', (req, res) => {
    const auth = req.currentUser;
    const uid = auth.uid;
    if (auth) {
        User.find({uid: uid}, (err, user) => {
            
        })
    }
})

export default userRouter;