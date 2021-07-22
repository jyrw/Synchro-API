import express from "express";
import Event from "../models/eventModel.js"

const eventsRouter = express.Router();

/**
 * Create a new event.
 */
/* Handled in parent document
eventsRouter.post('/', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const event = new Event(req.body);
        const savedEvent = event.save();
        return res.status(201).json(savedEvent);
    } else {
        return res.status(403).send('Not authorized');
    }
});
*/



/** 
 * Given an event objectId, return the event.
 */
/* Handled by population
eventsRouter.get('/:objectId', (req, res) => {
    const auth = req.currentUser;
    const id = req.body.id;
    if (auth) {
        Event.find({_id: id}, (err, event) => {
            if (err) {
                console.log(err);
            }
            return res.status(200).json(event.toJSON());
        })
    }
})
*/

eventsRouter.put('/:eventId', (req, res) => {
    const auth = req.currentUser;
    if (auth) {
        const eventId = req.params.eventId;
        Event.findOneAndUpdate({_id: eventId}, req.body)
            .exec((err, updatedEvent) => {
                return res.status(200).send('Event info changed');
            }) 
    } else {
        return res.status(403).send('Not authorized');
    }
})

export default eventsRouter;