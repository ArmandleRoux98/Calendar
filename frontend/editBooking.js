import buildPatientSelect from "./createBooking.js";

document.addEventListener("DOMContentLoaded", async () => {
    const durationValues = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get("booking_uid"));
    const res = await fetch(`http://localhost:3000/bookings/${urlParams.get("booking_uid")}`, {
        credentials: "include"
    });

    const data = await res.json();
    console.log(data.data);
    if (data.data.length > 0) {
        console.log(urlParams)
        const booking = data.data[0];
        await buildPatientSelect(urlParams.get("entity_uid"), Number(booking.patient_uid))
        // add date to date input
        const dateTime = booking.start_time;
        const date = dateTime.slice(0, 10);
        const time = dateTime.slice(11, 16);
        console.log(date);
        console.log(time);
        const dateInput = document.getElementById("booking_date");
        if (dateInput) {
            dateInput.value = date;
        }
        const timeInput = document.getElementById("booking_time");
        if (timeInput) {
            timeInput.value = time;
        }
        // add time to time input
        // add reason in reason text box
        const reason = booking.reason;
        console.log(reason);
        const reasonTextBox = document.getElementById("booking_reason");
        if (reasonTextBox) {
            reasonTextBox.value = reason
        }
        // add duration times
        const durationSelect = document.getElementById("duration")
        if (durationSelect){
            durationValues.forEach((value) => {
                const durationOption = document.createElement("option");
                durationOption.value = value;
                durationOption.text = value;
                if (value === booking.duration) {
                    durationOption.selected = true;
                }
                durationSelect.appendChild(durationOption);
            })
            
        }
    }
})

const editForm = document.getElementById("edit_booking")
if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target);
        console.log(formData);
        
        const data = Object.fromEntries(formData.entries());
        console.log("Form data:", data)

        const urlParams = new URLSearchParams(window.location.search);

        const res = await fetch(`http://localhost:3000/update/${urlParams.get("booking_uid")}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })

        // window.location.href = "index.html";
    })
}
