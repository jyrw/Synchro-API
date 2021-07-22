// TODO: Add error handling

import express from "express";
import User from "../models/userModel.js"
import Project from "../models/projectModel.js";
import Event from "../models/eventModel.js";

const usersRouter = express.Router();

/**
 * Create a new user.
 */
usersRouter.post('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const user = new User(req.body);
        const savedUser = user.save();
        return res.status(201).send('Created new user');
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
 * Get project info of user with uid userId
 */
usersRouter.get('/:userId/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        User.findOne({uid: uid}, 'projects')
            .populate('projects', '_id name endDate')
            .exec((err, user) => {
                return res.status(200).json(user);
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
            .exec((err, user) => {
                return res.status(200).json(user);
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

// Creates a project with request body and adds it to the user's project array.
usersRouter.put('/:userId/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        const project = new Project(req.body);
        User.findOne({uid: uid}, (err, user) => {
            project.users.push(user);
            project.save();
            user.projects.push(project);
            user.save();
            return res.status(201).send('Project created');
        })
    } else {
        return res.status(403).send('Not authorized');
    }
})

// Creates an event with request body and adds it to the user's event array.
usersRouter.put('/:userId/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.userId;
        const event = new Event(req.body);
        User.findOne({uid: uid}, (err, user) => {
            event.save();
            user.events.push(event);
            user.save();
            return res.status(201).send('Event created');
        })
    } else {
        return res.status(403).send('Not authorized');
    }
})

export default usersRouter;