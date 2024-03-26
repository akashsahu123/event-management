function checkMissingFields(fields, data) {
    const missingFields = [];

    for (const field of fields) {
        if (!data[field]) {
            missingFields.push(field);
        }
    }

    return missingFields;
}

function parseDate(date) {
    if (typeof date !== 'string')
        return false;

    const dateMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date);

    if (!dateMatch || dateMatch.length < 4)
        return false;

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    if (month < 1 || month > 12)
        return false;

    if (day < 1 || day > 31)
        return false;

    //check for correct number of days in the month of February
    if (month === 2 && (year % 4 === 0 && day > 29 || year % 4 !== 0 && day > 28))
        return false;

    //check for correct number of days in months having 30 days
    if ('4,6,9,11'.indexOf(String(month)) != -1 && day > 30)
        return false;

    return {
        year,
        month,
        day
    };
}

function parseTime(time) {
    if (typeof time !== 'string')
        return false;

    const timeMatch = /^(\d{2}):(\d{2}):(\d{2})$/.exec(time);

    if (!timeMatch || timeMatch.length < 4)
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
    if (typeof latitude !== 'number')
        return false;

    // Latitude range: -90 to 90 degrees
    return -90 <= latitude && latitude <= 90;
}

function isValidLongitude(longitude) {
    if (typeof longitude !== 'number')
        return false;
    // Longitude range: -180 to 180 degrees
    return -180 <= longitude && longitude <= 180;
}

export {
    checkMissingFields,
    parseDate,
    parseTime,
    isValidLatitude,
    isValidLongitude
}