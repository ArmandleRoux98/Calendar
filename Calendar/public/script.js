document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Retrieve form data
    const formData = new FormData(e.target);    
    const data = Object.fromEntries(formData.entries());

    // Request login
    try {
        const res = await fetch(`https://${window.location.host}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        console.log("Success", data);
       
        // Redirect to homepage
        window.location.href = "index.HTML";
    } catch (error){
        console.error("Error:", error);
    }
})
