import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: String,
    endDate: Date,
    users: [String],
    events: [{ type: Schema.ObjectId, ref: 'event'}]
});

const Project = new mongoose.model('Project', projectSchema);

export default Project;