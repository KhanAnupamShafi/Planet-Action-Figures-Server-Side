const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 5000;

//add Middleware
app.use(cors());
app.use(express.json());

//Connect to MongoDB Atlas
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cyduv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    //Create Database and Collection
    const database = client.db("toy_store");
    const toysCollection = database.collection("toys");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    //Post Registered users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);

      res.json(result);
    });

    //POST Order from client

    app.post("/orders", async (req, res) => {
      const orders = req.body;

      const result = await ordersCollection.insertOne(orders);

      res.json(result);
    });

    //POST reviews from client
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      console.log(reviews);
      const result = await reviewsCollection.insertOne(reviews);

      res.json(result);
    });
    //GET reviews from client
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();

      res.json(result);
    });

    //POST Products from admin

    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await toysCollection.insertOne(products);
      res.json(result);
    });

    //GET All products
    app.get("/products", async (req, res) => {
      const cursor = toysCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    //GET single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await toysCollection.findOne(query);

      res.json(product);
    });

    //GET All orders form users
    app.get("/orders/all", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();

      res.json(orders);
    });

    //Delete Orders Admin
    app.delete("/orders/all/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(filter);
      res.json(result);
    });
    //Delete Products Admin
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const result = await toysCollection.deleteOne(filter);
      res.json(result);
    });

    //Get Orders from a client
    app.get("/orders", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };

      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();

      res.json(orders);
    });

    //update order status

    app.put("/orders/all", async (req, res) => {
      const { _id, status } = req.body;
      const filter = { _id: ObjectId(_id) };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // Post Review

    //Get Admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;

      if (email) {
        const query = { email: email };

        const user = await usersCollection.findOne(query);

        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
        console.log(isAdmin);
      }
    });

    // Update Admin status

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    console.log("client connected");
  } finally {
    //   await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Planet Action Figures Server Running");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
