import 'dotenv/config';
import { createNewEvent, findEventsByDate } from "../models/events.model.js";
import {
    checkMissingFields,
    parseDate,
    parseTime,
    isValidLatitude,
    isValidLongitude
} from "../utils/events.utils.js";


async function httpCreateNewEvent(req, res) {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
            error: 'Content type should be json.'
        });
    }

    const data = req.body;

    const missingFields = checkMissingFields(['event_name', 'city_name', 'date', 'time', 'latitude', 'longitude'], data);

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Missing field${missingFields.length > 1 ? 's' : ''}.`,
            missing_fields: missingFields
        });
    }

    if (typeof data.event_name !== 'string' || data.event_name.length > 100) {
        return res.status(400).json({
            error: 'Invalid event name. Event name should be string not more than 100 characters long.'
        })
    }

    if (typeof data.city_name !== 'string' || data.city_name.length > 100) {
        return res.status(400).json({
            error: 'Invalid city name. City name should be string not more than 100 characters long.'
        })
    }

    if (!parseDate(data.date)) {
        return res.status(400).json({
            error: 'Invalid date. Date should be string in YYYY-MM-DD format.'
        });
    }

    const parsedTime = parseTime(data.time);

    if (!parsedTime) {
        return res.status(400).json({
            error: 'Invalid time. Time should be string in hh:mm:ss format.'
        });
    }

    const { hour, minute, second } = parsedTime;
    //convert the date and time to number of milliseconds
    const dateTime = new Date(data.date).getTime() + hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000;

    if (dateTime < new Date().getTime()) {
        return res.status(400).json({
            error: "Past date/time provided. Please provide future date/time."
        });
    }

    if (!isValidLatitude(data.latitude)) {
        return res.status(400).json({
            error: "Invalid latitude. Latitude should be a number between -90 to 90."
        });
    }

    if (!isValidLongitude(data.longitude)) {
        return res.status(400).json({
            error: "Invalid longitude. Longitude should be a number between -180 to 180."
        });
    }

    await createNewEvent(data);

    return res.status(201).json({
        success: "Event created successfully."
    });
}

async function httpFindEvents(req, res, next) {
    const params = req.query;

    const missingFields = checkMissingFields(['date', 'latitude', 'longitude'], params);

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Missing field${missingFields.length > 1 ? 's' : ''}.`,
            missing_fields: missingFields
        });
    }

    const date = params.date;

    if (!parseDate(date)) {
        return res.status(400).json({
            error: 'Invalid date. Date should be string in YYYY-MM-DD format.'
        });
    }

    const userLatitude = Number(params.latitude);

    if (!isValidLatitude(userLatitude)) {
        return res.status(400).json({
            error: "Invalid latitude. Latitude should be a number between -90 to 90."
        });
    }

    const userLongitude = Number(params.longitude);

    if (!isValidLongitude(userLongitude)) {
        return res.status(400).json({
            error: "Invalid longitude. Longitude should be a number between -180 to 180."
        });
    }

    if (params.page && !Number(params.page)) {
        return res.status(400).json({
            error: "Page should be a number."
        });
    }

    const page = Number(params.page) || 1;
    const pageSize = 10;
    const queryResult = await findEventsByDate(date, 14, page, pageSize);
    const totalPages = Math.ceil(queryResult.totalEvents / pageSize);

    const eventsData = {
        page,
        pageSize,
        totalEvents: queryResult.totalEvents,
        totalPages,
        events: []
    }

    if (page < 0 || page > totalPages) {
        eventsData.error = "Page out of range.";
        return res.status(400).json(eventsData);
    }

    const distancePromises = [];
    const weatherPromises = [];

    for (let event of queryResult.events) {
        const weatherApiUrl = `${process.env.WEATHER_API_URL}?code=${process.env.WEATHER_API_CODE}&city=${event.city_name}&date=${event.date}`;
        const distanceApiUrl = `${process.env.DISTANCE_API_URL}?code=${process.env.DISTANCE_API_CODE}&latitude1=${userLatitude}&longitude1=${userLongitude}&latitude2=${event.latitude}&longitude2=${event.longitude}`;
        distancePromises.push(fetch(distanceApiUrl));
        weatherPromises.push(fetch(weatherApiUrl));
        delete event.latitude;
        delete event.longitude;
        eventsData.events.push(event);
    }

    try {
        const responses = await Promise.all([...weatherPromises, ...distancePromises]);

        responses.forEach(response => {
            if (!response.ok)
                throw new Error("Network response was not ok.");
        });

        const values = await Promise.all(responses.map(response => response.json())); //contains distances and weathers

        for (let i = 0; i < values.length; ++i) {
            if (i < eventsData.events.length) {
                eventsData.events[i].weather = values[i].weather;
            }
            else {
                eventsData.events[i - eventsData.events.length].distance_km = values[i].distance;
            }
        }

        return res.status(200).json(eventsData);
    }
    catch (err) {
        console.error('Error in events controller: ', err);
        next(err);
    }
}

export {
    httpCreateNewEvent,
    httpFindEvents
}