document.getElementById("diary_select").addEventListener("change", async function() {
    const patients = await getPatients(JSON.parse(this.value).entity_uid)
    const patientSelect = document.getElementById("patient_select");
    patients.data.forEach(patient => {
        const option = document.createElement("option");
        option.value = patient.uid;
        option.textContent = `${patient.name} ${patient.surname}`;
        patientSelect.appendChild(option)
    })

    const bookingTypes = await getBookingTypes(JSON.parse(this.value));
    const bookingTypeSelect = document.getElementById("booking_type");
    console.log(bookingTypes)
    for (const bookingType of bookingTypes.data) {
        const option = document.createElement("option");
        option.value = bookingType.uid;
        option.textContent = bookingType.name;
        bookingTypeSelect.appendChild(option);
    }

    const bookingStatusSelect = document.getElementById("booking_status");
    const bookingStatuses = await getBookingStatuses(JSON.parse(this.value));
    console.log(bookingStatuses)
    for (const status of bookingStatuses.data) {
        const option = document.createElement("option");
        option.value = status.uid;
        option.textContent = status.name;
        bookingStatusSelect.appendChild(option)
    }
})

async function getPatients(entityUid) {
    console.log(entityUid)
    const params = new URLSearchParams();
    params.append("entity_uid", entityUid);
    
    const res = await fetch(`http://localhost:3000/patient?${params.toString()}`, {
        credentials: "include"
    })

    data = await res.json();
    console.log(data);
    return data;

}


async function getBookingTypes(diary) {
    console.log(diary)
    const params = new URLSearchParams();
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`http://localhost:3000/booking_type?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json()

    console.log(data)
    return data
}

async function getBookingStatuses(diary) {
    console.log(diary)
    const params = new URLSearchParams();
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`http://localhost:3000/booking_status?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json()

    console.log(data)
    return data
}

document.getElementById('create_booking').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(formData);
    
    const data = Object.fromEntries(formData.entries());
    console.log(data)

    const res = await fetch("http://localhost:3000/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
})