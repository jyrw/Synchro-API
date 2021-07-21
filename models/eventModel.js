import mongoose from "mongoose";

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: String,
    start: Date,
    end: Date
});

const Event = new mongoose.model('Event', eventSchema);

export default Event;   