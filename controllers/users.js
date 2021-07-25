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
        user.save();
        return res.status(201).send('Created new user');
    } else {
        return res.status(401).send('Not authorized');
    }
});

/**
 * Get user information (displayName, email) of user with the given uid
 */
usersRouter.get('/:uid', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        User.findOne({uid: uid}, 'displayName email')
            .exec((err, user) => {
                return res.status(200).json(user);
            })
    } else {
        return res.status(401).send('Not authorized');
    }
});

/**
 * Get project info of user with the given uid
 */
usersRouter.get('/:uid/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        User.findOne({uid: uid}, 'projects')
            .populate('projects', '_id name endDate')
            .exec((err, user) => {
                return res.status(200).json(user);
            })
    } else {
        return res.status(401).send('Not authorized');
    }
});

/** 
 * Get events of user with the given uid
 */
usersRouter.get('/:uid/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        User.findOne({uid: uid}, 'events')
            .populate('events') // Check if this is working properly
            .exec((err, user) => {
                return res.status(200).json(user);
            })
    } else {
        return res.status(401).send('Not authorized');
    }
});

// Change current user info
usersRouter.put('/:uid', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        User.findOneAndUpdate({uid: uid}, req.body, (err, updatedUser) => {
                return res.status(200).send('User info changed');
            }) 
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Creates a project with request body and adds it to the user's project array.
usersRouter.post('/:uid/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        const project = new Project(req.body);
        User.findOne({uid: uid}, (err, user) => {
            project.users.push(user);
            project.save();
            user.projects.push(project);
            user.save();
            return res.status(201).send('Project created');
        })
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Creates an event with request body and adds it to the user's event array.
usersRouter.post('/:uid/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        const event = new Event(req.body);
        User.findOne({uid: uid}, (err, user) => {
            event.save();
            user.events.push(event);
            user.save();
            return res.status(201).send('Event created');
        })
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Change event info
usersRouter.put('/:uid/events/:eventId', (req, res) => { // TODO: uid param not used?
    const auth = req.currentUser;
    if (auth) {
        const eventId = req.params.eventId;
        Event.findOneAndUpdate({_id: eventId}, req.body, (err, updatedEvent) => {
            return res.status(200).send('Event modified');
        })
        /* Validation for clashes: now handled by frontend
        const newStartDate = req.body.startDate;
        const newEndDate = req.body.endDate;
        User.findOne({uid: uid})
            .populate({
                path: 'events',
                match: { $or: 
                    [{ $and: [
                         { startDate: { $gt: newStartDate } },
                         { startDate: { $lt: newEndDate } }
                    ]},
                    { $and: [
                        { endDate: { $gt: newStartDate } },
                        { endDate: { $lt: newEndDate } }
                    ]}]
                }
            }).exec((err, user) => {
                if (user.events.length > 0) {
                    return res.status(401).send('New event clashes with existing schedule');
                } else {
                    Event.findOneAndUpdate({_id: eventId}, req.body)
                        .exec((err, updatedEvent) => {
                            return res.status(200).send('Event info changed')
                    })
                }
            })
            */  
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Delete event
usersRouter.delete('/:uid/events/:eventId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = req.params.uid;
        const eventId = req.params.eventId;
        User.findOneAndUpdate({uid: uid}, {$pull: {events: eventId}}, (err, user) => {
            console.log(user);
            Event.findOneAndDelete({_id: eventId}, (err, event) => {
                return res.status(200).send('Event deleted');
            })
        })
    } else {
        return res.status(401).send('Not authorized');
    }
})

export default usersRouter;