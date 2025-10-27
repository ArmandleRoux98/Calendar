document.addEventListener('DOMContentLoaded', async (e) => {
    try {
        const res = await fetch(`http://localhost:3000/diaries`, {
            credentials: 'include',
        });

        if (!res.ok) throw new Error("Error in response.");

        const data = await res.json();
        let select = document.getElementById('diary_select')
        if (!select) {
            select = document.createElement("select");}
        select.id = "diary_select"
        data.data.forEach(diary => {
            const option = document.createElement("option");
            option.value = JSON.stringify({"diary_uid": diary.uid, "entity_uid": diary.entity_uid});
            option.textContent = diary.name;
            select.appendChild(option);
        })
        const div = document.getElementById("diaries");
        console.log(data);
    } catch (error){
        console.log(error)
    }
})


const getBookings = document.getElementById("get_bookings")
if (getBookings) {
    getBookings.addEventListener("click", async => {
        loadBookings()
    })
}

const newBooking = document.getElementById("new_booking")
if (newBooking) {
    newBooking.addEventListener("click", () => {
        window.location.href = "create_booking.html";
    })
}

async function loadBookings() {
        const date = document.getElementById("booking_date").value;
        const diary = JSON.parse(document.getElementById("diary_select").value);
        const params = new URLSearchParams();
        params.append('date', date);
        params.append('diary_uid', diary.diary_uid);
        params.append('entity_uid', diary.entity_uid);

        try {
            const res = await fetch(`http://localhost:3000/bookings?${params.toString()}`, {
                credentials : "include",
            });
            if (!res.ok) throw new Error("Error in response.");
            const data = await res.json();
            // console.log(data)
            bookingDiv = document.getElementById("bookings");
            const table = await buildBookingsTable(data.data);
            bookingDiv.appendChild(table);

        } catch (error) {
            console.log(error);
        }
    }

async function buildBookingsTable(data) {
    const temp_table = document.getElementById("bookings_table");
    if (temp_table) {
        temp_table.remove()
    }
    // Build table
    const table = document.createElement("table");
    table.id = "bookings_table";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Build header row
    const headerRow = document.createElement("tr");
    const headers = [
        "Patient Name",
        "Patient Surname", 
        "Booking Type",
        "Status", 
        "Time", 
        "Duration(min)", 
        "Reason"];
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    })
    thead.appendChild(headerRow)

    // Build rest of table
    if (data.length > 0) {
        for (const booking of data) {
            if (!booking.cancelled) {
                const tr = document.createElement("tr");
                console.log(booking);
                const patientName = booking.patient_name;
                console.log(patientName);
                const patientSurname = booking.patient_surname;
                console.log(patientSurname);
                const booking_type = await getBookingType(booking.booking_type_uid);
                console.log("Booking Type:",  booking_type);
                const booking_status = await getBookingStatus(booking.booking_status_uid);
                const start_time = booking.start_time.slice(booking.start_time.length-8, booking.start_time.length-3);
                console.log(start_time);
                const duration = booking.duration;
                const reason = booking.reason;
                // Create all data
                // then create loop with td to add elements
                const bookingData = [
                    patientName, 
                    patientSurname, 
                    booking_type, 
                    booking_status, 
                    start_time, 
                    duration, 
                    reason];
                bookingData.forEach(value => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    tr.appendChild(td);
                })
                const delAnchor = document.createElement("form");
                delAnchor.action = `http://localhost:3000/delete/${booking.uid}`;
                delAnchor.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you would like to cancel this booking?")) {
                        try {
                            console.log(delAnchor.action)
                            const response = await fetch(delAnchor.action, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                credentials: "include"
                            })

                            if (!response.ok) throw new Error("Failed to delete booking.")
                            
                            await loadBookings()
                        } catch (error) {
                            console.log(error)
                        }
                    }
                })
                const delIcon = document.createElement("button");
                delIcon.type = "submit"
                delIcon.textContent = "Cancel";
                delAnchor.appendChild(delIcon);
                const deleteTd = document.createElement("td");
                deleteTd.appendChild(delAnchor);
                tr.appendChild(deleteTd);
                tbody.appendChild(tr);
            }
        }
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    return table
    
}

async function getBookingType(booking_type_uid) {
    const params = new URLSearchParams();
    params.append("booking_type_uid", booking_type_uid);
    const diary = JSON.parse(document.getElementById("diary_select").value);
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`http://localhost:3000/booking_type?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json()
    console.log(typeof(data.data[0].uid));
    booking_type_uid = Number(booking_type_uid)
    console.log(typeof(booking_type_uid))

    for (const type of data.data) {
        console.log("Type:", type.uid, type.name, "Booking_UID:", booking_type_uid)
        if (type.uid == booking_type_uid){
            return type.name;
        }
    }
}

async function getBookingStatus(booking_status_uid) {
    const params = new URLSearchParams();
    params.append("booking_status_uid", booking_status_uid);
    console.log(booking_status_uid);
    const diary = JSON.parse(document.getElementById("diary_select").value);
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`http://localhost:3000/booking_status?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json();
    console.log(typeof(data.data[0].uid));
    booking_status_uid = Number(booking_status_uid)
    console.log(typeof(booking_status_uid))

    for (const type of data.data) {
        console.log("Type:", type.uid, type.name, "Booking_UID:", booking_status_uid)
        if (type.uid == booking_status_uid){
            return type.name;
        }
    }

    return data.data.status;
}