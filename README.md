# Event Management API
This project is part of assignment for Backend Internship at GyanGrove. 
I have used Node.js and sqlite for creating this API.

In this assignment while fetching events by GET method, multiple calls to external apis were required to fetch the distance of user from event's venue and weather at the event.
Hence I decided to use Node.js due to its asynchronous and nonblocking I/O. In this API, calls to external APIs are made asynchronously for faster response time.

I decided to use sqlite for this assignemt as it is lightweight SQL database engine, although other relational database engines like PostgreSQL, MySQL could have been used. 
Data is structured with well-defined schema, so SQL is a good choice. I created B-Tree index on date column as multiple range queries had to be performed on date column.

## Installation and Configuration
### 1. Install Node.js
Install Node.js : [https://nodejs.org/en/download](https://nodejs.org/en/download)

### 2. Clone this repository
```
git clone https://github.com/akashsahu123/event-management
```

### 3. Change Directory
```
cd event-management
```

### 4. Install Dependencies
```
npm i
```

### 5. Create Environment
Create .env file in event-management directory:
```
PORT=3000
WEATHER_API_URL="https://gg-backend-assignment.azurewebsites.net/api/Weather"
WEATHER_API_CODE="KfQnTWHJbg1giyB_Q9Ih3Xu3L9QOBDTuU5zwqVikZepCAzFut3rqsg=="
DISTANCE_API_URL="https://gg-backend-assignment.azurewebsites.net/api/Distance"
DISTANCE_API_CODE="IAKvV2EvJa6Z6dEIUqqd7yGAu7IZ8gaH-a0QO6btjRc1AzFu8Y3IcQ=="
```

## Running
```
npm start
```

## Documentation
**NOTE**: I have given curl commands. Use postman or similar software if any of the command doesn't work.

This API has two endpoints:

### 1. GET /events/find
#### Request Format
Request to this endpoint requires following query parameters:
1. **date** : It should be in 'yyyy-mm-dd' format.
2. **latitude**: Latitude of user. It should be a real number in range [-90,90]
3. **longitude**: Longitude of user. It should be a real number in range [-180,180]

   
And following query parameter is optional:
1. **page**: page number. Each page will have 10 events (except last page which may have less than 10 events).

**Example of curl request:**
```
curl -w "\n" "https://event-management-1-z3s1.onrender.com/events/find?date=2024-03-15&latitude=40.7128&longitude=-74.0060"
```

#### Response Format
Response will be in json format. If there is any error from client or server side, response will have 'error' field explaining the error.

For example, if user forgets to include date parameter, then response will be:

![image](https://github.com/akashsahu123/event-management/assets/98690761/ebe6d568-93ab-447b-b555-6b5d1349a3ac)

If there is no error, then response will have following fields (in JSON response):
1. **page** : Page number. It will be 1 by default if you don't specify any page, otherwise it will be the page number which you specified in request parameters.
2. **pageSize**: Maximum number of events per page.
3. **totalEvents**: Total number of events within next 14 days of the date specified in reqeust parameter.
4. **totalPages**: Total number of pages.
5. **events**: An array of objects. Each object will be corresponding to an event with keys : event_name, city_name, date, weather, distance_km.

**Example Output**:

![image](https://github.com/akashsahu123/event-management/assets/98690761/467ac479-f278-463d-a4b4-fd1935dea635)

### 2. POST /events
#### Request Format
Request body should be json. Required fields:
1. **event_name**: Name of the event, not more than 100 characters long.
2. **city_name**: Name of the city of event, not more than 100 characters long.
3. **date**: Date of the event in 'yyyy-mm-dd' format.
4. **time**: Time of the event in 'hh:mm:ss' format.
5. **latitude**: Latitude of the event. It should be a real number in range [-90,90]
6. **longitude**: Longitude of event. It should be a real number in range [-180,180]

**Example of curl request:**
```
curl -X POST -H "Content-Type: application/json" -d "{\"event_name\":\"Shaurya 2024 IITR\",\"city_name\":\"saharanpur\",\"date\":\"2024-05-01\",\"time\":\"00:00:00\",\"latitude\":0,\"longitude\":0}" -w "\n" "https://event-management-1-z3s1.onrender.com/events"
```

#### Response Format
Response will be in json format. If there is any error from client or server side, response will have 'error' field explaining the error.

For example, if user provies the invalid date, then response will be:

![image](https://github.com/akashsahu123/event-management/assets/98690761/6b74a162-4ca2-4b2c-be80-eb3e9419f0e6)

If there is no error, then response will have success field. Example:

![image](https://github.com/akashsahu123/event-management/assets/98690761/349c77db-ab79-4ad4-8b7b-e80e41da51c8)


