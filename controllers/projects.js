import express from "express";
import Project from "../schemas/projectSchema.js";

const projectsRouter = express.Router();

// Create a new project
projectsRouter.post('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const project = new Project(req.body);
        const savedProject = project.save();
        return res.status(201).json(savedProject);
    } else {
        return res.status(403).send('Not authorized');
    }
});

// Given a project id, return the project document
projectsRouter.get('/', async (req, res) => {
    const auth = req.currentUser;
    const id = req.body.id;
    if (auth) {
        Project.find({_id: id}, (err, project) => {
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
projectsRouter.put('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        Project.find({_id: id}, (err, project) => {
            if (err) {
                console.log(err);
            }
            project.users.push(req.body.id) // req.id?
            return res.status(200).send('User added to project');
        })
    }
})

export default projectsRouter;