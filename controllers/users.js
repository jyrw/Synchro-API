// TODO: Add error handling

import express from "express";
import User from "../models/userModel.js"

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
 * Get user information (displayName, email) of user with uid userId
 */
usersRouter.get('/:userId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        User.findOne({uid: uid}, 'displayName email')
            .exec((err, user) => {
                return res.status(200).json(user);
            })
    } else {
        return res.status(403).send('Not authorized');
    }
});

/**
 * Get projects of user with uid userId
 */
usersRouter.get('/:userId/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        User.findOne({uid: uid}, 'projects')
            .populate('projects', '_id name') // Check if this is working properly
            .exec((err, projectArray) => {
                return res.status(200).json(projectArray);
            })
    } else {
        return res.status(403).send('Not authorized');
    }
});

/** 
 * Get events of user with uid userId
 */
usersRouter.get('/:userId/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        User.findOne({uid: uid}, 'events')
            .populate('events') // Check if this is working properly
            .exec((err, eventArray) => { 
                return res.status(200).json(eventArray);
            })
    } else {
        return res.status(403).send('Not authorized');  
    }
});

// Change current user info
usersRouter.put('/:userId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        User.findOneAndUpdate({uid: uid}, req.body)
            .exec((err, updatedUser) => {
                return res.status(200).send('User info changed');
            }) 
    } else {
        return res.status(403).send('Not authorized');
    }
})

// Add the given projectId to the user's project array.
usersRouter.put('/:userId/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        console.log(req.body.projectId);
        User.findOne({uid: uid}, (err, user) => {
            user.projects.push(req.body.projectId); // NOT WORKING
            return res.status(200).send('Project added to user');
        })
    } else {
        return res.status(403).send('Not authorized');
    }
})

// Add the given event to the user's event array.
usersRouter.put('/:userId/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        User.findOne({uid: uid}, (err, user) => {
            user.events.push(req.body.eventId); // probably not working either
            return res.status(200).send('Event added to user');
        })
    } else {
        return res.status(403).send('Not authorized');
    }
})

export default usersRouter;