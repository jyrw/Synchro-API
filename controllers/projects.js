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
        return res.status(403).send('Not authorized');
    }
});
*/

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
        return res.status(403).send('Not authorized');
    }
});

// Add a user to a project
projectsRouter.put('/:projectId/users', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        const email = req.body.email;
        Project.findOne({_id: projectId}, (err, project) => {
            User.findOne({email: email}, (err, user) => {
                if (!user) {
                    return res.status(404).send('User does not exist');
                }
                project.users.push(user);
                project.save();
                user.projects.push(project);
                user.save();
                return res.status(200).send('User added to project');
            })
        })
    }
})

// Creates an event with request body and adds it to the project's event array.
projectsRouter.put('/:projectId/events', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        const event = new Event(req.body);
        Project.findOne({_id: projectId}, (err, project) => {
            event.save();
            project.events.push(event);
            project.save();
            return res.status(201).send('Event created');
        })
    } else {
        return res.status(403).send('Not authorized');
    }
})

export default projectsRouter;