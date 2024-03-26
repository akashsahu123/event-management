import { getDB } from "./db.js";
import fs from "fs";
import path from "path";
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
        //date and time are stored as integers, by converting them to unix timestamp.
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
    const createEventPromises = [];

    return new Promise(async (resolve, reject) => {
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
                resolve(Promise.all(createEventPromises));
                console.log('All Events from data file saved in database.');
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

async function findEventsByDate(date, nextDays, page, pageSize) {
    const db = await getDB();

    return new Promise((resolve, reject) => {
        const startDate = new Date(date).getTime();
        const endDate = startDate + (nextDays + 1) * 24 * 60 * 60 * 1000;

        db.all(`SELECT event_name,city_name,date,latitude,longitude FROM events WHERE date BETWEEN ? AND ? ORDER BY date,time LIMIT ? OFFSET ?`, [startDate, endDate, pageSize, (page - 1) * pageSize], (err, events) => {
            if (err) {
                reject(err);
                return;
            }

            db.get('SELECT count(*) FROM events WHERE date BETWEEN ? AND ?', [startDate, endDate], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    events: events.map(event => {
                        const date = new Date(event.date);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        event.date = formattedDate;
                        return event;
                    }),
                    totalEvents: row['count(*)']
                });
            });
        })
    });
}

async function getAllEvents() {
    const db = await getDB();

    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM events ORDER BY date,time', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        })
    });
}

export {
    loadEventsInDB,
    createNewEvent,
    findEventsByDate,
    getAllEvents
}