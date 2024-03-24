import express from 'express';
import eventsRouter from './controllers/events.route.js';

const app = express();
app.use('/events', eventsRouter);

export default app;