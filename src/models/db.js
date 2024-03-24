import sqlite3 from "sqlite3";
import path from 'path';
import 'dotenv/config';

const dirname = import.meta.dirname;

let db = null;

async function getDB() {
    if (db)
        return db;

    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(path.join(dirname, '..', '..', 'data', 'events.db'));

        db.on('error', (err) => {
            db = null;
            reject(err);
        });

        db.on('open', () => {
            resolve(db);
        })
    });
}

export {
    getDB
};