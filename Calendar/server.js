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

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
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

// Get available diaries and return them in JSON response.
app.get("/diaries", async (req, res) => {
    const fields = [
        "uid",
        "entity_uid",
        "name"
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/diary?${params.toString()}`;
    try {
        const response = await fetch(endPoint, {
            method: "GET",
            headers: {
                "Cookie": `session_id=${req.cookies.session_id}`
            }
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}\nError: ${response.statusText}`);
        const data = await response.json()

        console.log("Success", data);

        res.json(data)
    } catch (error) {
        console.error("Error:", error);
    };
});

// Retrieve bookings in diary with the given diary uid and on the specified date
app.get("/bookings", async (req, res) => {
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

// Retrieve booking with given booking uid
app.get("/bookings/:uid", async (req, res) => {
    console.log(req.params.uid);
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

// Update booking with given booking uid
app.post("/update/:uid", async (req, res) => {
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

// Retrieves all booking types available for given entity and dairy uids
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

// Retrieves all booking statuses available for given entity and dairy uids
app.get("/booking_status", async (req, res) => {
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

// Retrieves all patients available for given entity
app.get("/patient", async (req, res) => {
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


// Make API request to GXWeb to create new booking with given information
app.post("/create", async (req, res) => {
    console.log("Request has been made")
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
    console.log(payload)
    if (payload.model.start_time.length === 19) {
        console.log("Test")
        try {
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
app.put("/delete/:uid", async (req, res) => {
    const bookingUid = req.params.uid
    const payload = {
        "model": {
            "uid": Number(bookingUid),
            "cancelled": true
        }
    }
    try {
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