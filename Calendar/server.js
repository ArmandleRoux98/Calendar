import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(cors({
    origin: `${process.env.HOST}`,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Authenticate user on GXWeb, retrieve session id and
 * store it in a cookie.
 * @route POST /login
 */

app.post('/login', async (req, res) => {
    // Retrieve credentials
    const { username, password } = req.body;
    // Build payload for API call
    const payload = {
        "model": {
            "timeout": 259200
        },
        "auth": [
            "password",
            {
                "username": username,
                "password": password
            }
        ]
    }
    try {
        // Call to GXWeb to authenticate credentials
        const response = await fetch("https://dev_interview.qagoodx.co.za/api/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        const sessionID = `${data.data.uid}`

        // Add session id to cookie
        res.cookie("session_id", sessionID, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log("Success", data.data.uid);
        res.json({ uid: data.data.uid })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Login Failed" });
    }
});

/**
 * Retrieve available diaries from GXWeb and return the 
 * data as a JSON response.
 * @route GET /diaries
 */
app.get("/diaries", async (req, res) => {
    // Create parameters to build endpoint
    const fields = [
        "uid",
        "entity_uid",
        "name"
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/diary?${params.toString()}`;
    try {
        // Call to GXWeb to get diary data
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        
        // Return JSON response
        const data = await response.json()
        console.log("Success", data);
        res.json(data)

    } catch (error) {
        console.error("Error:", error);
    };
});

/**
 * Retrieve bookings in diary with the given diary uid 
 * and on the specified date from GXWeb and return data 
 * as a JSON response
 * @route GET /bookings
 */
app.get("/bookings", async (req, res) => {
    // Create parameters to build endpoint
    const { date, diary_uid } = req.query;
    const fields = [
        ["AS", ["I", "patient_uid", "name"], "patient_name"],
        ["AS", ["I", "patient_uid", "surname"], "patient_surname"],
        "uid",
        "entity_uid",
        "booking_type_uid",
        "booking_status_uid",
        "patient_uid",
        "start_time",
        "duration",
        "reason",
        "cancelled"
    ]
    const filter = [
        "AND",
        [
            "=",
            ["I", "diary_uid"],
            ["L", Number(diary_uid)]
        ],
        [
            "=",
            [
                "::",
                ["I", "start_time"],
                ["I", "date"]
            ],
            ["L", date]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking?${params.toString()}`;
    try {
        // Call to GXWeb to get booking data
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        
        const data = await response.json();
        res.json(data)

    } catch (error) {
        console.error("Error:", error);
    };
})

/**
 * Retrieve booking with the given uid in diary 
 * from GXWeb and return data as a JSON response
 * @route GET /bookings/:uid
 */
app.get("/bookings/:uid", async (req, res) => {
    // Create parameters to build endpoint
    const bookingUid = req.params.uid
    const fields = [
        "uid",
        "entity_uid",
        "patient_uid",
        "start_time",
        "duration",
        "reason",
        "cancelled"
    ]
    const filter = [
        "=",
        ["I", "uid"],
        ["L", Number(bookingUid)]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking?${params.toString()}`;
    try {
        // Call to GXWeb to get data for booking with given uid
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        const data = await response.json();

        res.json(data);


    } catch (error) {
        console.error("Error:", error);
    };
})

/**
 * Update booking with the given uid in diary
 * from GXWeb and return data as a JSON response
 * @route GET /update/:uid
 */
app.post("/update/:uid", async (req, res) => {
    // Create data from request to build payload
    const uid = Number(req.params.uid)
    const date = `${req.body.booking_date}T${req.body.booking_time}:00`
    const duration = Number(req.body.duration)
    const patientUid = Number(req.body.patient)
    const reason = req.body.booking_reason
    const payload = {
        "model":
        {
            "uid": uid,
            "start_time": date,
            "duration": duration,
            "patient_uid": patientUid,
            "reason": reason,
            "cancelled": false
        }
    }
    try {
        // Call to GXWeb to update booking with given uid
        const response = await fetch(`https://dev_interview.qagoodx.co.za/api/booking/${uid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `session_id=${req.cookies.session_id}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);

        const data = await response.json();

        res.json(data);

        console.log("Booking Updated Successfully: ", data)
    } catch (error) {
        console.error("Error:", error);
    };
})

/**
 * Retrieve booking types in diary with the given
 * uid from GXWeb and return data as a JSON response
 * @route GET /booking_type
 */
app.get("/booking_type", async (req, res) => {
    const entityUid = req.query.entity_uid;
    const diaryUid = req.query.diary_uid;


    const fields = [
        "uid",
        "name"
    ]
    const filter = ["AND",
        ["=",
            ["I", "entity_uid"],
            ["L", Number(entityUid)]
        ],
        ["=",
            ["I", "diary_uid"],
            ["L", Number(diaryUid)]
        ],
        ["NOT",
            ["I", "disabled"]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking_type?${params.toString()}`;
    try {
        // Call to GXWeb to get all booking types
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        const data = await response.json();

        console.log("Success", data);
        res.json(data);


    } catch (error) {
        console.error("Error:", error);
    };
})

/**
 * Retrieve booking statuses in diary with the given
 * uid from GXWeb and return data as a JSON response
 * @route GET /booking_status
 */
app.get("/booking_status", async (req, res) => {
    // Create parameters to build endpoint
    const entityUid = Number(req.query.entity_uid);
    const diaryUid = Number(req.query.diary_uid);
    const fields = [
        "uid",
        "name"
    ]
    const filter = ["AND",
        ["=",
            ["I", "entity_uid"],
            ["L", entityUid]
        ],
        ["=",
            ["I", "diary_uid"],
            ["L", diaryUid]
        ],
        ["NOT",
            ["I", "disabled"]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking_status?${params.toString()}`;
    try {
        // Call to GXWeb to get all booking statuses
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        const data = await response.json();

        console.log("Success", data);
        res.json(data)

    } catch (error) {
        console.error("Error:", error);
    };
})

/**
 * Retrieve patients statuses in diary with the given
 * uid from GXWeb and return data as a JSON response
 * @route GET /patient
 */
app.get("/patient", async (req, res) => {
    // Create parameters to build endpoint
    const entityUid = Number(req.query.entity_uid);
    const fields = [
        "uid",
        "name",
        "surname",
    ]
    const filter = [
        "=",
        ["I", "entity_uid"],
        ["L", entityUid]
    ]
    const limit = 100
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    params.append('limit', limit)
    const endPoint = `https://dev_interview.qagoodx.co.za/api/patient?${params.toString()}`;
    try {
        // // Call to GXWeb to get all patient data
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error("Error:", error);
    };
})


/**
 * Post request to GXWeb to create a booking in the diary
 * with the given uid with the given information and return
 * data as JSON response
 * @route GET /create
 */
app.post("/create", async (req, res) => {
    // Get data from request to build payload
    const diary = req.query
    const payload = {
        "model": {
            "entity_uid": Number(diary["entity_uid"]),
            "diary_uid": Number(diary["diary_uid"]),
            "booking_type_uid": Number(req.body.booking_type),
            "booking_status_uid": Number(req.body.booking_status),
            "start_time": `${req.body.booking_date}T${req.body.booking_time}:00`,
            "duration": Number(req.body.duration),
            "patient_uid": Number(req.body.patient),
            "reason": req.body.booking_reason,
            "cancelled": false
        }
    }
    if (payload.model.start_time.length === 19) {
        try {
            // Call to GXWeb to create new booking
            const response = await fetch("https://dev_interview.qagoodx.co.za/api/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": `session_id=${req.cookies.session_id}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);

            const data = await response.json();
            res.json(data);

            console.log("Booking Created Successfully: ", data)
        } catch (error) {
            console.error("Error:", error);
        };
    }
})

// Make API request to GXWeb to cancel booking with given booking uid
/**
 * Put request to GXWeb to cancel the booking with the given uid 
 * and return data as JSON response
 * @route GET //delete/:uid
 */
app.put("/delete/:uid", async (req, res) => {
    // Get data from request to build payload
    const bookingUid = req.params.uid
    const payload = {
        "model": {
            "uid": Number(bookingUid),
            "cancelled": true
        }
    }
    try {
        // Call to GXWeb to cancel booking
        const response = await fetch(`https://dev_interview.qagoodx.co.za/api/booking/${bookingUid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `session_id=${req.cookies.session_id}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        res.json(data);

        console.log("Booking Deleted Successfully: ", data)
    } catch (error) {
        console.error("Error:", error);
    };
})

app.listen(port, () => {
    console.log(`Application running - listening on port ${port}`);
})