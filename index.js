const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const app = express()
const cors = require('cors');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 4000;

// middlewire use
app.use(cors())
app.use(express.json());

const verifyJWT = (req, res, next) => {
    console.log("hitting JWT")
    const autorization = req.headers.autorization;
    if (!autorization) {
        return res.status(401).send({ error: true, message: "unautorized access" })
    }
    const token = autorization.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_KEY_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send({ error: true, message: "unautorized access" })
        }
        req.decoded = decoded;
        next();
    })
}


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
        // create verify Admin middlewire
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            console.log(email)
            const query = { email: email };
            const user = await userCollection.findOne(query)
            if (user?.role !== "admin") {
                return res.status(403).send({ error: true, message: "forbidden" })
            }
            next();
        }


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        // ACCESS KEY JWT START
        app.post("/jwt", (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.jwt_token, { expiresIn: "1h" })
            res.send({ token });
        })


        // collection name
        const classCollection = client.db("kiriya_yoga").collection("classes");
        const userCollection = client.db("kiriya_yoga").collection("users");
        const courceCollection = client.db("kiriya_yoga").collection("cources");

        // classes 
        app.post("/classes",verifyJWT, async(req, res) => {
            const newClass = req.body;
            const result = await classCollection.insertOne(newClass)
            console.log(newClass)
            res.send(result);
        })
        app.get("/classes", async(req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result)
        })
        app.get("/classes-img", async(req, res) => {
            const result = await classCollection.find().sort({ studentsCount: -1 }).limit(6).project({ image: 1 }).toArray();
            res.send(result)
        })



        // user
        app.post("/users", async(req, res) => {
            const user = req.body;
            const query = {email: user.email}
            const existingUser = await userCollection.findOne(query);
            if(existingUser){
                return res.send({message: "User already exist"})
            }
            console.log(user)
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get("/users", async(req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        app.get("/instructors", async(req, res) => {
            const result = await userCollection.find({ rule: "instructor" }).toArray();
            res.send(result)
        })

        app.get("/instructors-img", async(req, res) => {
            const result = await userCollection.find().sort({ totalStudents: -1 }).limit(6).project({ image: 1 }).toArray();
            res.send(result)
        })

        
        // /select-cources
        app.post("/select-cources", async(req, res) => {
            const cources = req.body;
            const result = await courceCollection.insertOne(cources);
            console.log(cources);
            res.send(result);
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