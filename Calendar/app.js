import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
app.use(cors({
    origin: "http://localhost:5500",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser())

app.get('/', (req, res) => {
    console.log(req.cookie)
    res.send("Hello, world!");
});

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
        res.json({ uid: data.data.uid})
    } catch(error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Login Failed"});
    }
});

// Get available diaries
app.get("/diaries", async (req, res) => {
    const fields = [
        "uid",
        "entity_uid",
        "treating_doctor_uid",
        "service_center_uid",
        "booking_type_uid",
        "name",
        "uuid",
        "disabled",
    ]
    const filter = [
        "AND",
        [
            "=",
            ["I","entity_uid"],
            ["L", ""]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/diary?${params.toString()}`;
    console.log(endPoint);
    console.log(req.cookies.session_id);
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
    } catch(error) {
        console.error("Error:", error);
    };
});


app.get("/bookings", async (req, res) => {
    const { date, diary_uid, entity_uid } = req.query;
    console.log(req.query);
    console.log(date, diary_uid, entity_uid);
    console.log(Number(diary_uid))
    const fields = [
        ["AS",["I","patient_uid","name"],"patient_name"],
        ["AS",["I","patient_uid","surname"],"patient_surname"],
        ["AS",["I","patient_uid","debtor_uid","name"],"debtor_name"],
        ["AS",["I","patient_uid","debtor_uid","surname"],"debtor_surname"],
        "uid",
        "entity_uid",
        "diary_uid",
        "booking_type_uid",
        "booking_status_uid",
        "patient_uid",
        "start_time",
        "duration",
        "treating_doctor_uid",
        "reason",
        "invoice_nr",
        "cancelled",
        "uuid"
    ]
    const filter = [
        "AND",
        [
            "=",
            ["I","diary_uid"],
            ["L",Number(diary_uid)]
        ],
        [
            "=",
            [
                "::",
                ["I","start_time"],
                ["I","date"]
            ],
            ["L",date]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking?${params.toString()}`;
    console.log(endPoint);
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

    } catch(error) {
        console.error("Error:", error);
    };
})

app.get("/booking_type", async (req, res) => {
    const entityUid = req.query.entity_uid;
    const diaryUid = req.query.diary_uid;


    const fields = [
        "uid",
        "entity_uid",
        "diary_uid",
        "name",
        "booking_status_uid",
        "disabled",
        "uuid"
    ]
    const filter = ["AND",
        ["=",
            ["I","entity_uid"],
            ["L",Number(entityUid)]
        ],
        ["=",
            ["I","diary_uid"],
            ["L",Number(diaryUid)]
        ],
        ["NOT",
            ["I","disabled"]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking_type?${params.toString()}`;
    console.log(endPoint);
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


    } catch(error) {
        console.error("Error:", error);
    };
})


app.get("/booking_status", async (req, res) => {
    const entityUid = Number(req.query.entity_uid);
    const diaryUid = Number(req.query.diary_uid);


    const fields = [
        "uid",
        "entity_uid",
        "diary_uid",
        "name",
        "next_booking_status_uid",
        "is_arrived",
        "is_final",
        "disabled"
    ]
    const filter = ["AND",
        ["=",
            ["I","entity_uid"],
            ["L",entityUid]
        ],
        ["=",
            ["I","diary_uid"],
            ["L",diaryUid]
        ],
        ["NOT",
            ["I","disabled"]
        ]
    ]
    const params = new URLSearchParams();
    params.append('fields', JSON.stringify(fields));
    params.append('filter', JSON.stringify(filter));
    const endPoint = `https://dev_interview.qagoodx.co.za/api/booking_status?${params.toString()}`;
    console.log(endPoint);
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

    } catch(error) {
        console.error("Error:", error);
    };
})


app.get("/patient", async (req, res) => {
    const entityUid = Number(req.query.entity_uid);
    console.log(entityUid);

    const fields = [
        "uid",
        "entity_uid",
        "debtor_uid",
        "name",
        "surname",
        "initials",
        "title",
        "id_type",
        "id_no",
        "date_of_birth",
        "mobile_no",
        "email",
        "file_no",
        "gender",
        "dependant_no",
        "dependant_type",
        "acc_identifier",
        "gap_medical_aid_option_uid",
        "gap_medical_aid_no",
        "private",
        "patient_classification_uid"
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
    console.log(endPoint);
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

    } catch(error) {
        console.error("Error:", error);
    };
})

app.post("/create", async (req, res) => {
    console.log(req.body)
    const diary = JSON.parse(req.body.diary)
    const payload = {
        "model": {
            "entity_uid": Number(diary["entity_uid"]),
            "diary_uid": Number(diary["diary_uid"]),
            "booking_type_uid": Number(req.body.booking_type),
            "booking_status_uid": Number(req.body.booking_status),
            "start_time": `${req.body.booking_date}T${req.body.booking_time}:00`,
            "duration": 15,
            "patient_uid": Number(req.body.patient),
            "reason": req.body.booking_reason,
            "cancelled": false
        }
    }
    console.log(payload)
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

    console.log("Booking Created Successfully: ", data)
    } catch(error) {
        console.error("Error:", error);
    };
})


app.put("/delete/:uid", async (req, res) => {
    const bookingUid = req.params.uid
    console.log(bookingUid)
    const payload = {
        "model": {
            "uid": Number(bookingUid),
            "cancelled": true
        }
    }
    console.log(payload)
    try {
        console.log(req.cookies.session_id)
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

    console.log("Booking Deleted Successfully: ", data)
    } catch(error) {
        console.error("Error:", error);
    };
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})