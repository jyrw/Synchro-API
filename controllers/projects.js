import express from "express";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";

const projectsRouter = express.Router();

/* Project creation now handled in user router
// Create a new project, return the project id in json (correct way?) // TODO check for duplicate project name
projectsRouter.post('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = auth.uid; // Or pass in body?
        const project = new Project(req.body);
        User.findOne({uid: uid}, (err, user) => {
            project.users.push(user);
            project.save();
            user.projects.push(project);
            user.save();
            return res.status(201).send('Created new project');
        })
    } else {
        return res.status(401).send('Not authorized');
    }
});
*/

// Required as population in usersRouter only includes basic fields for views // TODO: Split up? Wasteful to get all info when only events must refresh
// Given a project id, return the project document
projectsRouter.get('/:projectId', async (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        Project.findOne({_id: projectId})
            .populate('users', 'displayName email')
            .populate('events')
            .exec((err, project) => {
                 return res.status(200).json(project); // TODO: calculate? and/or separate into diff endpoints
            });
    } else {
        return res.status(401).send('Not authorized');
    }
});

// Get project events (wip)
projectsRouter.get('/:projectId/events', async (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        Project.findOne({_id: projectId})
            .populate({
                path: "users",
                model: "user",
                populate: {path: "events", model: "event"}
            }).exec((err, project) => {
                console.log(project);
                return res.status(200).send(project)
            })
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Change project info
projectsRouter.put('/:projectId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        Project.findOneAndUpdate({_id: projectId}, req.body, (err, project) => {
            return res.status(200).send('Project info changed');
        })
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Add a user to a project // ? Only allow team leader to add? ? remove project events to prevent clashes?
projectsRouter.put('/:projectId/users', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        const email = req.body.email;
        Project.findOne({_id: projectId}, (err, project) => {
            User.findOne({email: email}, (err, user) => { // findOneAndUpdate and $push instead?
                if (!user) {
                    return res.status(404).send('User does not exist'); // Validation for user input
                } else {
                    project.users.push(user);
                    project.save();
                    user.projects.push(project);
                    project.events.forEach(eventId => user.events.push(eventId));
                    user.save();
                    return res.status(200).send('User added to project');
                }
            })
        })
    }  
})

// Remove a user from a project // TODO: Remove project events from user's array
projectsRouter.delete('/:projectId/users', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        const userId = req.body.userId; // _id field of user, NOT uid
        Project.findOneAndUpdate({_id: projectId}, {$pull: {users: userId}}, (err, project) => {
            User.findOneAndUpdate({_id: userId}, {$pull: {projects: projectId}}, 
                (err, user) => {
                    console.log(user);
                    return res.status(200).send('User removed from project');
                })
        })        
    }
})

// TODO: Fix user array
// Creates an event with request body (title, start, end) and adds it to the project's event array.
projectsRouter.post('/:projectId/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = auth.uid;
        const projectId = req.params.projectId;
        req.body.project = projectId; // Add project field to body
        const event = new Event(req.body);
        Project.findOne({_id: projectId}, (err, project) => {
            if (project.users.length == 0) { // || uid !== project.users[0]) { // Request sent from unauthorized client
                return res.status(403).send('Unauthorized: Creation of team events is only available to project owner');
            } else {
                event.save();
                project.events.push(event);
                project.save();
                return res.status(201).send('Event created');
            }
        })
    } else {
        return res.status(401).send('Not authorized');
    }
})

// Change event info
projectsRouter.put('/:projectId/events/:eventId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = auth.uid;
        const projectId = req.params.projectId;
        const eventId = req.params.eventId;
        Project.findOne({_id: projectId}, (err, project) => {
            if (project.users.length == 0) { //|| uid !== project.users[0]) { // Request sent from unauthorized client
                return res.status(403).send('Unauthorized: Creation of team events is only available to project owner');
            } else {
                Event.findOneAndUpdate({_id: eventId}, req.body, (err, event) => {
                    return res.status(200).send('Event modified');
                })
            }
        })
    }
})

// TODO: Check user array
// Delete event
projectsRouter.delete('/:projectId/events/:eventId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = auth.uid;
        const projectId = req.params.projectId;
        const eventId = req.params.eventId;
        Project.findOneAndUpdate({_id: projectId}, {$pull: {events: eventId}}, (err, project) => {
            if (project.users.length == 0) { // || uid !== project.users[0]) { // Request sent from unauthorized client
                return res.status(403).send('Unauthorized: Creation of team events is only available to project owner');
            } else {
                project.users.forEach(userId => User.findOneAndUpdate({_id: userId}, {$pull: {events: eventId}}, (err, user) => {}));
                Event.findOneAndDelete({_id: eventId}, (err, event) => {
                    return res.status(200).send('Event deleted');
                })  
            }
        })
    }
})

// TODO: Delete project

export default projectsRouter;