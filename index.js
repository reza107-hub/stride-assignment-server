const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 4000

// Middleware

app.use(express.json());
app.use(cors());

// jwt

app.post('/authentication', async (req, res) => {
    const { email } = req.body;
    const token = jwt.sign(email, process.env.SECRET_KEY, { expiresIn: `${process.env.TOKEN_EXP}` })
    res.send({ token })
})

// jwt verify

const verifyJWT = (req, res, next) => {
    const authorization = req.header.authorization
    if (!authorization) {
        return res.send({ message: "Invalid authorization" })
    }

    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.send({ message: "Invalid token" })
        }
        req.decoded = decoded
        next()
    })
}

// mongodb

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `${process.env.MONGODB_URL}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dbConnect = async () => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // collection
        const userCollection = await client.db("strideAssignmentCollection").collection("users");


        // crud

        // default admin
        const ensureAdminExists = async () => {
            const adminEmail = "sabab54874@rabitex.com"; // Replace with your admin's email
            const existingAdmin = await userCollection.findOne({ email: adminEmail });

            if (!existingAdmin) {
                const defaultAdmin = {
                    email: adminEmail,
                    name: "Default Admin",
                    image: "https://i.postimg.cc/CMjzNLXf/MG-1010-Copy.jpg",
                    role: "admin",
                    userStatus: "unbanned",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await userCollection.insertOne(defaultAdmin);
                console.log("Default admin user created.");
            } else {
                console.log("Admin user already exists.");
            }
        };

        await ensureAdminExists();

        // user create
        app.post('/create-user', async (req, res) => {

            const { email, name, image, role } = req.body;

            if (email === "sabab54874@rabitex.com") {
                return
            }

            const existingUser = await userCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).send("User already exists.");
            }

            const user = {
                email,
                name,
                image,
                role,
                userStatus: "unbanned",
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            if (role === "buyer") {
                user.wishlist = [],
                    user.cart = [],
                    user.totalCartPrice = null
            }

            const result = await userCollection.insertOne(user)
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.log({ error });
    }
}

dbConnect()

//api

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Cart: [
//             {
//                 Id
//                 userId
//                 productId:
//                 quantity
//                 totalPrice
//             }
//         ]