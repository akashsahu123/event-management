function parseDate(date) {
    const dateMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date);

    if (dateMatch.length == 0)
        return false;

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    if (month < 1 || month > 12)
        return false;

    if (day < 1 || day > 31)
        return false;

    if (month === 2 && (year % 4 === 0 && day > 29 || year % 4 !== 0 && day > 28))
        return false;

    if ('4,6,9,11'.indexOf(String(month)) != -1 && day > 30)
        return false;

    return {
        year,
        month,
        day
    };
}

function parseTime(time) {
    const timeMatch = /^(\d{2}):(\d{2}):(\d{2})$/.exec(time);

    if (timeMatch.length == 0)
        return false;

    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const second = Number(timeMatch[3]);

    if (hour > 23 || minute > 59 || second > 59)
        return false;

    return {
        hour,
        minute,
        second
    };
}

function isValidLatitude(latitude) {
    // Latitude range: -90 to 90 degrees
    const latitudeRegex = /^-?([0-8]?[0-9]|90)(\.\d{1,15})?$/;
    return latitudeRegex.test(String(latitude));
}

function isValidLongitude(longitude) {
    // Longitude range: -180 to 180 degrees
    const longitudeRegex = /^-?((1[0-7]|[0-9])?[0-9]|180)(\.\d{1,15})?$/;
    return longitudeRegex.test(String(longitude));
}


function httpCreateNewEvent(req, res) {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
            error: 'Content type should be json.'
        });
    }

    const data = req.body;

    if (!data.city_name) {
        return res.status(400).json({
            error: 'Missing city_name field.'
        });
    }

    if (!data.event_name) {
        return res.status(400).json({
            error: 'Missing event_name field.'
        });
    }

    if (!data.date) {
        return res.status(400).json({
            error: 'Missing date field.'
        });
    }

    if (!data.time) {
        return res.status(400).json({
            error: 'Missing time field.'
        });
    }

    if (!data.latitude) {
        return res.status(400).json({
            error: 'Missing latitude field.'
        });
    }

    if (!data.longitude) {
        return res.status(400).json({
            error: 'Missing longitude field.'
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

    if (typeof data.date !== 'string' || !parseDate(data.date)) {
        return res.status(400).json({
            error: 'Invalid date. Date should be string in YYYY-MM-DD format.'
        });
    }

    const timeObj = parseTime(data.time);

    if (typeof data.time !== 'string' || !timeObj) {
        return res.status(400).json({
            error: 'Invalid time. Time should be string in hh:mm:ss format.'
        });
    }

    const dateTime = new Date(data.date).getTime() + timeObj.hour * 60 * 60 * 1000 + timeObj.minute * 60 * 1000 + timeObj.second * 1000;

    if (dateTime < new Date().getTime()) {
        return res.status(400).json({
            error: "Past date/time provided. Please provide future date/time."
        });
    }

    if (typeof data.latitude !== 'number' || !isValidLatitude(data.latitude)) {
        return res.status(400).json({
            error: "Invalid latitude. Latitude should be a number with at most 15 digits after decimal."
        });
    }

    if (typeof data.longitude !== 'number' || !isValidLatitude(data.longitude)) {
        return res.status(400).json({
            error: "Invalid longitude. Longitude should be a number with at most 15 digits after decimal."
        });
    }
}

function httpFindEvents(req, res) {

}

export {
    httpCreateNewEvent,
    httpFindEvents
}