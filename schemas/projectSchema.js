import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: String,
    users: [String],
    events: [Schema.ObjectId]
})

const Project = new mongoose.model('Project', projectSchema);

export default Project;