import express from "express";
import User from "../schemas/userSchema.js"

const usersRouter = express.Router();

/**
 * Create a new user.
 */
usersRouter.post('/', (req, res) => {
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
usersRouter.get('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = auth.uid;
        User.find({uid: uid}, (err, user) => {
            return res.status(200).json(user);
        })
    } else {
        return res.status(403).send('Not authorized');
    }
});

// Add the given projectId to the user's project array.
usersRouter.put('/', (req, res) => {
    const auth = req.currentUser;
    const uid = auth.uid;
    if (auth) {
        User.find({uid: uid}, (err, user) => {
            user.projects.push(req.body.id) // req.id?
            return res.status(200).send('Project added to user');
        })
    } else {
        return res.status(403).send('Not authorized');
    }
})

export default usersRouter;