import express from "express";
import Project from "../schemas/projectSchema.js";

const projectsRouter = express.Router();

projectsRouter.get('/projects', async (req, res) => {
    const auth = req.currentUser;
    const uid = auth.uid;
    if (auth) { // no...check user with the uid's arr of projects
        Project.find({uid: uid}, (err, projects) => {
            return res.json(projects.map(project => project.toJSON()));
        });
    } else {
        return res.status(403).send('Not authorized');
    }
});

projectsRouter.post('/projects', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const project = new Project(req.body);
        const savedProject = project.save();
        return res.status(201).json(savedProject);
    } else {
        return res.status(403).send('Not authorized');
    }
});

export default projectsRouter;