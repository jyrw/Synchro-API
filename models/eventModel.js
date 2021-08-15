import mongoose from "mongoose";

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: String,
  start: Date,
  end: Date,
  project: { type: Schema.ObjectId, ref: "Project" },
});

const Event = new mongoose.model("Event", eventSchema);

export default Event;
