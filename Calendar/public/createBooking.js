
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const diary = {
        entity_uid: urlParams.get("entity_uid"),
        diary_uid: urlParams.get("diary_uid")
    }

    await buildPatientSelect(urlParams.get("entity_uid"))

    // retrieve booking types and create select element
    const bookingTypes = await getBookingTypes(diary);
    const bookingTypeSelect = document.getElementById("booking_type");
    console.log(bookingTypes)
    for (const bookingType of bookingTypes.data.reverse()) {
        const option = document.createElement("option");
        option.value = bookingType.uid;
        option.textContent = bookingType.name;
        bookingTypeSelect.appendChild(option);
    }
    // retrieve booking statuses and create select element
    const bookingStatusSelect = document.getElementById("booking_status");
    const bookingStatuses = await getBookingStatuses(diary);
    console.log(bookingStatuses)
    for (const status of bookingStatuses.data) {
        const option = document.createElement("option");
        option.value = status.uid;
        option.textContent = status.name;
        bookingStatusSelect.appendChild(option)
    }

    createDurationSelect();
    
})    

/**
 * Builds a select elements containing patient names and surnames of the entity with given uid
 * @param {number} entityUid - Uid of entity.
 * @param {number} patientUid - Uid of patient to focus on select.
 */
export default async function buildPatientSelect(entityUid, patientUid = -1) {
    const patientSelect = document.getElementById("patient_select")
    if (patientSelect) {
        const patients = await getPatients(entityUid);
        patients.data.forEach(patient => {
            const option = document.createElement("option");
            option.value = patient.uid;
            option.textContent = `${patient.name} ${patient.surname}`;
            if (patientUid === patient.uid) {
                option.selected = true;
            }
            patientSelect.appendChild(option);
        })
    }
}

/**
 * Makes API call to backend to retrieve all patients of entity with given uid.
 * @param {number} entityUid - Uid of entity.
 * @returns {json} data - json with all patient data.
 */
async function getPatients(entityUid) {
    console.log(entityUid)
    const params = new URLSearchParams();
    params.append("entity_uid", entityUid);
    
    const res = await fetch(`http://localhost:3000/patient?${params.toString()}`, {
        credentials: "include"
    })

    const data = await res.json();
    console.log(data);
    return data;

}


/**
 * Gets select element "duration" from DOM and populates it with options.
 * @param {number} bookingDuration - value of booking duration to focus in select.
**/
export async function createDurationSelect(bookingDuration) {
    const durationValues = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const durationSelect = document.getElementById("duration")
    if (durationSelect){
        durationValues.forEach((value) => {
            const durationOption = document.createElement("option");
            durationOption.value = value;
            durationOption.text = value;
            if (value === bookingDuration) {
                durationOption.selected = true;
            }
            durationSelect.appendChild(durationOption);
        })
        
    }
}

/**
 * Retrieve all available booking types for given diary.
 * @param {json} diary - diary to retrieve booking types of.
 * @returns {json} data - json with all booking types.
**/
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

/**
 * Retrieve all available booking statuses for given diary.
 * @param {json} diary - diary to retrieve booking statuses of.
 * @returns {json} data - json with all booking statuses.
**/
async function getBookingStatuses(diary) {
    console.log(diary)
    const params = new URLSearchParams();
    params.append('diary_uid', diary.diary_uid);
    params.append('entity_uid', diary.entity_uid);

    const res = await fetch(`${window.location.host}/booking_status?${params.toString()}`, {
        credentials : "include"
    })
    const data = await res.json()

    console.log(data)
    return data
}

const createBookingForm = document.getElementById('create_booking')
if (createBookingForm) {
    createBookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Retrieve data from form and url parameters
        const urlParams = new URLSearchParams(window.location.search);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Call to backend to apply update to booking
        try {
            const res = await fetch(`${window.location.host}/create?${urlParams.toString()}`, {
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
        window.location.href = "index.html";
    })    
}
    