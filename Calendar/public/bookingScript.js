document.addEventListener('DOMContentLoaded', async () => {
    if (!document.cookie.includes("session_id")) {
        window.location.href = "/login.html";
        return;
    }
    // Add todays date to date input
    const today = new Date().toJSON();
    const bookingDateInput = document.getElementById("booking_date");
    if (!bookingDateInput.value){
        bookingDateInput.value = today.slice(0, 10);
    }
    
    // Fetch all available diaries to build diary select element
    try {
        const res = await fetch(`https://${window.location.host}/diaries`, {
            credentials: 'include',
        });

        if (!res.ok) throw new Error("Error in response.");

        const data = await res.json();
        const diaries = data.data;
        let select = document.getElementById('diary_select');
        if (!select) {
            select = document.createElement("select");
        }
        select.id = "diary_select"
        diaries.forEach(diary => {
            const option = document.createElement("option");
            option.value = JSON.stringify({"diary_uid": diary.uid, "entity_uid": diary.entity_uid});
            option.textContent = diary.name;
            select.appendChild(option);
        })
        if (diaries.length > 0) {
            loadBookings();
        }
        applyNewBooking();
    } catch (error){
        console.log(error);
    }
})

// Add bookings to "get_bookings" div
const bookingDateInput = document.getElementById("booking_date")
if (bookingDateInput) {
    bookingDateInput.addEventListener("change", () => {
        loadBookings();
    })
}


/**
 * Apply on click event lister to "new_booking" to navigate user to 
 * create_booking.html with diary_uid and entity_uid parameters
 */
async function applyNewBooking() {
    const newBooking = document.getElementById("new_booking")
    if (newBooking) {
        const diarySelect = document.getElementById("diary_select");
        const dairyData = JSON.parse(diarySelect.value);
        const params = new URLSearchParams();
        params.append("diary_uid", dairyData.diary_uid);
        params.append("entity_uid", dairyData.entity_uid);
        newBooking.addEventListener("click", () => {
            window.location.href = `create_booking.html?${params.toString()}`;
        })
    }
}

/**
 * Make API call to backend to retrieve bookings for selected date and
 * and add it to a table element.
 */
async function loadBookings() {
        const date = document.getElementById("booking_date").value;
        if (date.length === 0){
            return
        }
        const diary = JSON.parse(document.getElementById("diary_select").value);
        const params = new URLSearchParams();
        params.append('date', date);
        params.append('diary_uid', diary.diary_uid);

        try {
            const res = await fetch(`https://${window.location.host}/bookings?${params.toString()}`, {
                credentials : "include",
            });
            if (!res.ok) throw new Error("Error in response.");
            const data = await res.json();

            const bookingDiv = document.getElementById("bookings");
            if (bookingDiv) {
                const table = await buildBookingsTable(data.data);
                bookingDiv.appendChild(table);
            } else {
                console.log("bookings elements not found")
            }

        } catch (error) {
            console.log(error);
        }
    }

/**
 * Creates a table element that is populated with the bookings data provided.
 * @param {json} data - bookings data to load into table.
 * @returns {HTMLTableElement} Table populated with booking data provided. 
 */
async function buildBookingsTable(data) {
    // Destroy previous table
    const temp_table = document.getElementById("bookings_table");
    if (temp_table) {
        temp_table.remove();
    }

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
    thead.classList.add("table-dark");

    const bookingTypes = await getBookingTypes();
    const bookingStatuses = await getBookingStatuses();
    let bookingType = "";
    let bookingStatus = "";
    // Build table body
    if (data.length > 0) {
        for (const booking of data) {
            if (!booking.cancelled) {
                // Retrieve data for all attributes of booking
                const tr = document.createElement("tr");
                const patientName = booking.patient_name;
                const patientSurname = booking.patient_surname;
                bookingTypes.forEach(type => {
                    if (type.uid === booking.booking_type_uid){
                        bookingType = type.name;
                    }
                })
                bookingStatuses.forEach(type => {
                    if (type.uid === booking.booking_type_uid){
                        bookingStatus = type.name;
                    }
                })
                const start_time = booking.start_time.slice(booking.start_time.length-8, booking.start_time.length-3);
                const duration = booking.duration;
                const reason = booking.reason;
                // Add all data to list to create td elements
                const bookingData = [
                    patientName, 
                    patientSurname, 
                    bookingType, 
                    bookingStatus, 
                    start_time, 
                    duration, 
                    reason];
                // Create td elements
                bookingData.forEach(value => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    tr.appendChild(td);
                })
                // Add edit and delete buttons
                const editButton = createEditButton(booking.uid, booking.entity_uid)
                const editTd = document.createElement("td");
                editTd.appendChild(editButton);
                tr.appendChild(editTd);
                const delButton = createDeleteButton(booking.uid)
                const deleteTd = document.createElement("td");
                deleteTd.appendChild(delButton);
                tr.appendChild(deleteTd);
                
                tbody.appendChild(tr);
            }
        }
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    table.classList.add("table", "table-striped", "table-hover", "align-middle", "text-center", "rounded");

    const bookingsDiv = document.getElementById("bookings")
    bookingsDiv.appendChild(table)

    return table
    
}

/**
 * Creates a delete button linked to given booking uid that will call to 
 * the backend to cancel the booking with the linked uid.
 * @param {number} bookingUid - Uid of booking to attach to delete button.
 * @returns {HTMLButtonElement} Delete button linked to given booking uid.
 */
function createDeleteButton(bookingUid) {
    const delButton = document.createElement("form");
    delButton.action = `https://${window.location.host}/delete/${bookingUid}`;
    delButton.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (confirm("Are you sure you would like to cancel this booking?")) {
            try {
                const response = await fetch(delButton.action, {
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
    delIcon.textContent = "❌ Cancel";
    delIcon.classList.add("btn", "btn-danger") 
    delButton.appendChild(delIcon);

    return delButton
}

/**
 * Creates a edit button linked to given booking uid that will call to 
 * the backend to edit the booking with the linked uid.
 * @param {number} bookingUid - Uid of booking to attach to edit button.
 * @returns {HTMLButtonElement} Edit button linked to given booking uid.
 */
function createEditButton(bookingUid, entityUid) {
    const params = new URLSearchParams();
    params.append("booking_uid", bookingUid);
    params.append("entity_uid", entityUid);
    
    const editButton = document.createElement("button");
    editButton.type = "submit";
    editButton.textContent = "📝 Edit";
    editButton.classList.add("btn", "btn-secondary") 
    editButton.addEventListener("click", () => {
        window.location.href = `edit_booking.html?${params.toString()}`
    })

    return editButton
}


async function getBookingTypes() {
    const params = new URLSearchParams();
    const diary = JSON.parse(document.getElementById("diary_select").value);
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`https://${window.location.host}/booking_type?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json();
    return data.data;
}

async function getBookingStatuses() {
    const params = new URLSearchParams();
    const diary = JSON.parse(document.getElementById("diary_select").value);
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`https://${window.location.host}/booking_status?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json();
    return data.data;
}