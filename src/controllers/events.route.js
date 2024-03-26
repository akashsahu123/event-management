import express from 'express';
import { httpCreateNewEvent, httpFindEvents } from './events.controller.js';

const eventsRouter = express.Router();

eventsRouter.use(express.json(), (err, req, res, next) => {
    console.error('Error: ', err);

    return res.status(400).json({
        error: "Request Body contains invalid json."
    })
});

eventsRouter.post('/', httpCreateNewEvent);
eventsRouter.get('/find', httpFindEvents);

eventsRouter.use((err, req, res, next) => {
    console.error('Error:', err.message);

    return res.status(500).json({
        error: 'An error occurred.'
    });
});

export default eventsRouter;