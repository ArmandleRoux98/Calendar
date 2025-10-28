document.addEventListener("DOMContentLoaded", async () => {
    const durationValues = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    
    urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get("booking_uid"));
    const res = await fetch(`http://localhost:3000/bookings/${urlParams.get("booking_uid")}`, {
        credentials: "include"
    });

    const data = await res.json();
    console.log(data.data);
    if (data.data.length > 0) {
        const booking = data.data[0];
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
                durationSelect.appendChild(durationOption);
            })
            
        }
    }

})