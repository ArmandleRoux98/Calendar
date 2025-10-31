import app from "./server.js";

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Application running - listening on port ${port}`);
})