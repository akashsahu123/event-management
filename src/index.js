import http from 'node:http';
import 'dotenv/config';
import app from './app.js';
import { loadEventsInDB } from './models/events.model.js';

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await loadEventsInDB();

        server.listen(PORT, () => {
            console.log(`Server listening on PORT : ${PORT}`);
        });
    }
    catch (err) {
        console.error('Some error occured loading events in db: ', err);
    }
}

startServer();
