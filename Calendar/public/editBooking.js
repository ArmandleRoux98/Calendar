import buildPatientSelect from "./createBooking.js";

document.addEventListener("DOMContentLoaded", async () => {  
    const urlParams = new URLSearchParams(window.location.search);
    // Retrieve data for specified booking
    const res = await fetch(`${window.location.host}/bookings/${urlParams.get("booking_uid")}`, {
        credentials: "include"
    });
    const data = await res.json();

    if (data.data.length > 0) {
        const booking = data.data[0];
        await buildPatientSelect(urlParams.get("entity_uid"), Number(booking.patient_uid))
        
        // Create date and time inputs and fill with booking data
        const dateTime = booking.start_time;
        const date = dateTime.slice(0, 10);
        const time = dateTime.slice(11, 16);
        const dateInput = document.getElementById("booking_date");
        if (dateInput) {
            dateInput.value = date;
        }
        const timeInput = document.getElementById("booking_time");
        if (timeInput) {
            timeInput.value = time;
        }
        // Create text box and fill with booking reason
        const reason = booking.reason;
        console.log(reason);
        const reasonTextBox = document.getElementById("booking_reason");
        if (reasonTextBox) {
            reasonTextBox.value = reason
        }
        // Create duration select  (replace with import function form createBooking.js)
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

// On form submission make API call to backend to apply updated data to booking 
const editForm = document.getElementById("edit_booking")
if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        // Retrieve data from form and url parameters
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const urlParams = new URLSearchParams(window.location.search);

        // Call to backend to apply update to booking
        try {
            const res = await fetch(`${window.location.host}/update/${urlParams.get("booking_uid")}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                throw new Error((`Update booking failed: ${res.text()}`));
            }

            // Redirect to home page
            window.location.href = "./index.html";
        } catch (error) {
            console.error(error)
        }

    })
}
