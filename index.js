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

        //to get data
        app.get("/products", async (req, res) => {
            const result = await productsCollection.find().toArray();
            res.send(result);
        });


        //to get single data
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
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

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`smart server is running on port:${port}`);
});

