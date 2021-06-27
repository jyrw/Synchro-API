import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import projectsRouter from './controllers/projects.js';
import usersRouter from './controllers/users.js';
import decodeIDToken from "./authenticateToken.js";

const app = express();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(decodeIDToken);
app.use("/api", [projectsRouter, usersRouter]);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const mongoDB = 'mongodb+srv://jyrw:^AtT&uT4aXYL3T@synchro.ap1ng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
    console.log('Connected to database');
    })
    .catch((err) => {
    console.log('Error connecting to DB', err.message);
    });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error'));