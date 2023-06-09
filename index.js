const express = require("express");
const app = express()
const cors = require('cors');
require("dotenv").config();
const port = process.env.PORT || 4000;

// middlewire use
app.use(cors())
app.us




app.get('/', (req, res) => {
    res.send('Server is Running !!')
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})