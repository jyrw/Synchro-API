import express from "express";
import Project from "../models/projectModel.js";

const projectsRouter = express.Router();

// Create a new project, return the project id in json (correct way?) // TODO check for duplicate project name
projectsRouter.post('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const project = new Project(req.body);
        project.save();
        return res.status(201).json({savedProjectId: project._id});
    } else {
        return res.status(403).send('Not authorized');
    }
});

// Given a project id, return the project document
projectsRouter.get('/:projectId', async (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const id = req.params.projectId;
        Project.findOne({_id: id}, (err, project) => {
            if (err) {
                console.log(err);
            }
            return res.status(200).json(project.toJSON());
        });
    } else {
        return res.status(403).send('Not authorized');
    }
});

// Add a user to a project
projectsRouter.put('/:projectId/users', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const id = req.params.projectId;
        Project.find({_id: id}, (err, project) => {
            if (err) {
                console.log(err);
            }
            project.users.push(req.body.id) // fix this
            return res.status(200).send('User added to project');
        })
    }
})

export default projectsRouter;