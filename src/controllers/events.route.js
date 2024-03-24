import express from 'express';
import { httpCreateNewEvent, httpFindEvents } from './events.controller.js';

const eventsRouter = express.Router();

eventsRouter.post('/', httpCreateNewEvent);
eventsRouter.get('/find', httpFindEvents);

export default eventsRouter;