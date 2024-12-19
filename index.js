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
    if (!email) {
        return res.send({ message: "Email is required" });
    }
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: `${process.env.TOKEN_EXP}` })
    res.send({ token })
})

// jwt verify

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization || !authorization.startsWith("Bearer ")) {
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

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const usersCollection = await client.db("strideAssignmentCollection").collection("users");
        const productsCollection = await client.db("strideAssignmentCollection").collection("products");


        // verify buyer
        const verifyBuyer = async (req, res, next) => {
            try {
                const email = req.decoded?.email; // Safely access decoded.email
                if (!email) {
                    return res.status(400).send({ message: "Email not found in token." });
                }

                const findBuyer = await usersCollection.findOne({ email });
                if (!findBuyer) {
                    return res.status(404).send({ message: "User not found." });
                }

                if (findBuyer.role === "buyer") {
                    return next();
                }

                return res.status(403).send({ message: "The user is not a buyer." });
            } catch (error) {
                console.error("Error in verifyBuyer middleware:", error);
                return res.status(500).send({ message: "Internal server error." });
            }
        };

        // verify seller
        const verifySeller = async (req, res, next) => {
            try {
                const email = req.decoded?.email; // Safely access decoded.email
                if (!email) {
                    return res.status(400).send({ message: "Email not found in token." });
                }

                const findBuyer = await usersCollection.findOne({ email });
                if (!findBuyer) {
                    return res.status(404).send({ message: "User not found." });
                }

                if (findBuyer.role === "seller") {
                    return next();
                }

                return res.status(403).send({ message: "The user is not a seller." });
            } catch (error) {
                console.error("Error in verifyBuyer middleware:", error);
                return res.status(500).send({ message: "Internal server error." });
            }
        };

        // verify Admin
        const verifyAdmin = async (req, res, next) => {
            try {
                const email = req.decoded?.email; // Safely access decoded.email
                if (!email) {
                    return res.status(400).send({ message: "Email not found in token." });
                }

                const findBuyer = await usersCollection.findOne({ email });
                if (!findBuyer) {
                    return res.status(404).send({ message: "User not found." });
                }

                if (findBuyer.role === "admin") {
                    return next();
                }

                return res.status(403).send({ message: "The user is not a admin." });
            } catch (error) {
                console.error("Error in verifyBuyer middleware:", error);
                return res.status(500).send({ message: "Internal server error." });
            }
        };


        // crud

        // default admin
        const ensureAdminExists = async () => {
            const adminEmail = "sabab54874@rabitex.com"; // Replace with your admin's email
            const existingAdmin = await usersCollection.findOne({ email: adminEmail });

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

                await usersCollection.insertOne(defaultAdmin);
                console.log("Default admin user created.");
            } else {
                console.log("Admin user already exists.");
            }
        };

        await ensureAdminExists();

        // user create
        app.post('/create-user', async (req, res) => {

            const { email, name, image, role } = req.body;

            if (!email || !name || !role) {
                return res.status(400).send({ message: "Email, name, and role are required" });
            }

            if (email === "sabab54874@rabitex.com") {
                return
            }

            const existingUser = await usersCollection.findOne({ email });
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

            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        // get product
        app.get('/get-products', async (req, res) => {
            const { name, category, brand, limit = 10, page = 1, sort } = req.query;
            const query = {};

            // Add filters to the query
            if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive partial match
            if (category) query.category = category;
            if (brand) query.brand = brand;

            let sortOption = {};
            if (sort === "asc") {
                sortOption.price = 1; // Ascending order
            } else if (sort === "desc") {
                sortOption.price = -1; // Descending order
            }

            const products = await productsCollection
                .find(query)
                .sort(sortOption)
                .skip((page - 1) * Number(limit)) // Pagination
                .limit(Number(limit))
                .toArray();

            res.send(products);
        })

        // add product
        app.post('/add-product', verifyJWT, verifySeller, async (req, res) => {
            const { name, price, category, brand, details, stock, image } = req.body;

            // Construct product object
            const product = {
                name,
                price: parseFloat(price), // Ensure price is a number
                category,
                brand,
                details,
                stock: parseInt(stock), // Ensure stock is a number
                image,
                sellerEmail: req.decoded.email, // Use the seller's email from the token
                ratings: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await productsCollection.insertOne(product);
            res.send(result)

        })

        // add product on wishlist
        app.patch('/add-to-wishlist', verifyJWT, verifyBuyer, async (req, res) => {
            const { productId } = req.body;
            if (!productId) {
                return res.send({ message: "Product ID is required" });
            }
            const result = await usersCollection.findOneAndUpdate(
                { email: req.decoded.email },
                { $addToSet: { wishlist: productId } },
            );
            res.send(result)
        })

        // add cart
        app.patch('/add-cart', verifyJWT, verifyBuyer, async (req, res) => {
            const { productId, quantity } = req.body;

            const email = req.decoded.email;

            // Fetch product details to ensure it's valid
            const product = await productsCollection.findOne({ _id: new ObjectId(toString(productId)) });
            if (!product) {
                return res.send({ message: "Product not found" });
            }

            // Get user and update cart
            const user = await usersCollection.findOne({ email });
            if (!user) {
                return res.send({ message: "User not found" });
            }

            const productInCart = user.cart.find(item => item.productId.toString() === productId);

            if (productInCart) {
                // If the product is already in the cart, update the quantity
                const updatedCart = user.cart.map(item =>
                    item.productId.toString() === productId ?
                        { ...item, quantity: item.quantity + quantity, totalPrice: item.totalPrice + (product.price * quantity) } : item
                );

                const updatedTotalCartPrice = updatedCart.reduce((acc, item) => acc + item.totalPrice, 0);

                await usersCollection.updateOne(
                    { email },
                    {
                        $set: { cart: updatedCart, totalCartPrice: updatedTotalCartPrice },
                    }
                );
                return res.send({ message: "Cart updated successfully" });
            } else {
                // If the product is not in the cart, add it
                const newItem = {
                    productId,
                    quantity,
                    totalPrice: product.price * quantity
                };

                const updatedCart = [...user.cart, newItem];
                const updatedTotalCartPrice = updatedCart.reduce((acc, item) => acc + item.totalPrice, 0);

                await usersCollection.updateOne(
                    { email },
                    {
                        $set: { cart: updatedCart, totalCartPrice: updatedTotalCartPrice },
                    }
                );
                return res.send({ message: "Product added to cart successfully" });
            }
        });





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