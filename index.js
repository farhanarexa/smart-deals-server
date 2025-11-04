const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://SimpleDBuser:TGKmQLKBh8kz6MT6@cluster0.scnhrfl.mongodb.net/?appName=Cluster0";

//create aClient to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("smart server is running");
});

async function run() {
    try {
        await client.connect();

        const db = client.db("smartDB");
        const productsCollection = db.collection("products");
        // for bids collection
        const bidsCollection = db.collection("bids");
        //for user collection
        const usersCollection = db.collection("users");

        // Users API
        app.post("/users", async (req, res) => {
            const user = req.body;
            const email = req.body.email;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "user already exists" });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        //to get data (Product API)
        app.get("/products", async (req, res) => {
            const result = await productsCollection.find().toArray();
            res.send(result);
        });

        app.get("/latestProducts", async (req, res) => {
            const result = await productsCollection.find().sort({ created_at: -1 }).limit(6).toArray();
            res.send(result);
        });

        //to get single data
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            try {
                const result = await productsCollection.findOne({ _id: id });

                if (!result) {
                    return res.status(404).json({ error: "Product not found" });
                }

                res.json(result);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ error: "Server error" });
            }
        });


        //to post data
        app.post("/products", async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });


        //to update data
        app.patch("/products/:id", async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price
                }
            }
            const result = await productsCollection.updateOne(query, updateDoc);
            res.send(result);
        });


        //to delete data
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        //bids related API
        app.get("/bids", async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.buyer_email = email;
            }
            const result = await bidsCollection.find(query).toArray();
            res.send(result);
        });

        app.post("/bids", async (req, res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`smart server is running on port:${port}`);
});

