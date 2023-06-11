const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const app = express()
const cors = require('cors');
require("dotenv").config();
const port = process.env.PORT || 4000;

// middlewire use
app.use(cors())
app.use(express.json());


// MONGO DB 
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.clipjzr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // collection name
        const classCollection = client.db("kiriya_yoga").collection("classes");
        const instructorCollection = client.db("kiriya_yoga").collection("instractor");

        // classes 
        app.get("/classes", async(req, res) => {
            const result = await classCollection.find().sort({ studentsCount: -1 }).limit(6).project({ image: 1 }).toArray();
            res.send(result)
        })



        // instructor
        app.get("/instructors", async(req, res) => {
            const result = await instructorCollection.find().sort({ totalStudents: -1 }).limit(6).project({ image: 1 }).toArray();
            res.send(result)
        })




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// MONGO DB 


app.get('/', (req, res) => {
    res.send('Server is Running !!')
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})