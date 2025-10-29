document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Retrieve form data
    const formData = new FormData(e.target);    
    const data = Object.fromEntries(formData.entries());

    await fetch("http://localhost:3000/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Success", data);
        window.location.href = "index.HTML";
    })
    .catch(error => {
        console.error("Error:", error);
    });    
})  
