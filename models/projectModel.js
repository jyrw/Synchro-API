import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: String,
  endDate: Date,
  users: [{ type: Schema.ObjectId, ref: "User" }],
  events: [{ type: Schema.ObjectId, ref: "Event" }],
});

const Project = new mongoose.model("Project", projectSchema);

export default Project;
