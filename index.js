import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import decodeIDToken from './authenticateToken.js';
import usersRouter from './controllers/users.js';
import projectsRouter from './controllers/projects.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(decodeIDToken);

app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const mongoDB = 'mongodb+srv://jyrw:^AtT&uT4aXYL3T@synchro.ap1ng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.log('Error connecting to DB', err.message);
    });