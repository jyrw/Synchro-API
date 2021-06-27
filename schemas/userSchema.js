import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    uid: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    events: [{ type: Schema.ObjectId, ref: 'event'}],
    projects: [{ type: Schema.ObjectId, ref: 'user'}]
    /*
    displayPicture: {
        type: String,
        get: v => `${root}${v}`
    }
    */
})

const User = mongoose.model('User', userSchema);

export default User;