import express from "express";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";

const projectsRouter = express.Router();

// Create a new project, return the project id in json (correct way?) // TODO check for duplicate project name
projectsRouter.post('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const uid = auth.uid; // Or pass in body?
        const project = new Project(req.body);
        User.findOne({uid: uid}, (err, user) => {
            project.users.push(user);
            console.log(user);
            project.save();
            return res.status(201).json({savedProjectId: project._id});
        })
    } else {
        return res.status(403).send('Not authorized');
    }
});

// Given a project id, return the project document
projectsRouter.get('/:projectId', async (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const projectId = req.params.projectId;
        Project.findOne({_id: projectId}, (err, project) => {
            if (err) {
                console.log(err);
            }
            return res.status(200).json(project.toJSON()); // TODO: populate/calculate and/or separate into diff endpoints
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
                project.users.push(user);
                project.save();
                return res.status(200).send('User added to project');
            })
        })
    }
})

export default projectsRouter;