import { getDB } from "./db.js";
import fs from "fs";
import path, { resolve } from "path";
import { parse } from "csv-parse";

const __dirname = import.meta.dirname;

async function checkEventsTableExists() {
    const db = await getDB();

    return new Promise((resolve, reject) => {
        db.get(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name='events'`, (err, row) => {
            if (err) {
                console.error('Error Checking TABLE Existence: ', err);
                reject(err);
            }
            else {
                resolve(row['count(*)'] === 1);
            }
        });
    });
}

async function createEventsTable() {
    const db = await getDB();

    return new Promise((resolve, reject) => {
        db.run(`
        CREATE TABLE IF NOT EXISTS events(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            city_name TEXT NOT NULL,
            date INTEGER NOT NULL,
            time INTEGER NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS date_index ON events(date);
        `, (err) => {
            if (err) {
                console.error('Error Creating TABLE   :', err);
                reject(err);
            }
            else {
                console.log('DB created successfully.');
                resolve();
            }
        });
    });
}

const DATA_FILE_URL = path.join(__dirname, "..", "..", "data", "events-dataset.csv");

async function populateEvents() {
    const db = await getDB();
    const createEventPromises = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(DATA_FILE_URL)
            .on("error", (err) => {
                console.error('Error reading events-dataset.csv : ', err);
                reject(err);
            })
            .pipe(parse({ columns: true }))
            .on("data", async (data) => {
                createEventPromises.push(createNewEvent(data));
            })
            .on("error", (err) => {
                console.error('Error :', err);
                reject(err);
            })
            .on("end", async () => {
                console.log('All Events from data file saved in database.');
                resolve(Promise.all(createEventPromises));
            })
    });
}

async function loadEventsInDB() {
    const eventsTableExists = await checkEventsTableExists();

    if (eventsTableExists)
        return;

    await createEventsTable();
    await populateEvents();
}

async function createNewEvent(data) {
    const db = await getDB();
    const event_name = data.event_name;
    const city_name = data.city_name;
    const date = new Date(data['date']).getTime();
    const time_splitted = data['time'].split(':').map(Number);
    const time = time_splitted[0] * 60 * 60 * 1000 + time_splitted[1] * 60 * 1000 + time_splitted[2] * 1000;
    const latitude = parseFloat(data.latitude);
    const longitude = parseFloat(data.longitude);

    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO events(event_name,city_name,date,time,latitude,longitude) VALUES(?,?,?,?,?,?)`,
            [event_name, city_name, date, time, latitude, longitude],
            (err) => {
                err ? reject(err) : resolve();
            });
    });
}

async function findEvents(date, nextDays) {
    const db = await getDB();

    return new Promise((resolve, reject) => {
        const startDate = new Date(date).getTime();
        const endDate = startDate + (nextDays - 1) * 24 * 60 * 60 * 1000;

        db.all('SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date', [startDate, endDate], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        })
    });
}

async function getAllEvents() {
    const db = await getDB();

    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM events ORDER BY date', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        })
    });
}

// async function run() {
//     try {
//         const db = await getDB();
//         await loadEventsInDB();
//         await createNewEvent({ event_name: 'Akash Sahu', city_name: 'Saharanpur', date: '2024-03-01', time: '9:30:00', latitude: 1.1, longitude: 1.1 });

//         console.log((await findEvents('2024-03-01', 1)).map(row => {
//             row.date = new Date(row.date).toISOString();
//             return row;
//         }));
//     }
//     catch (e) {
//         console.log('Error:', e);
//     }
// }

// run();

// setInterval(run, 4000);

export {
    loadEventsInDB,
    createNewEvent,
    findEvents,
    getAllEvents
}