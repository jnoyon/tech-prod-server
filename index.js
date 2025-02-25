const express = require('express')
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
const cors = require('cors');
app.use(cors()); 
app.use(express.json()); 


  
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kn8zv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
      // await client.connect();
      // Send a ping to confirm a successful connection

      const productsCollection = client.db('TechProd').collection('productCollection');
      const usersCollection = client.db('TechProd').collection('userCollection');
      const reviewsCollection = client.db('StockRoom').collection('reviewCollection');
      const couponsCollection = client.db('StockRoom').collection('couponCollection');
      const voteCollection = client.db('StockRoom').collection('voteCollection');
      
      app.post('/products', async (req, res) => {
        const newProduct = req.body;
    
        if (!newProduct.productName || !newProduct.productImage) {
            return res.status(400).json({ message: 'Product name and image are required.' });
        }
    
        const result = await productsCollection.insertOne(newProduct);
        res.status(201).json({ message: 'Product added successfully', productId: result.insertedId });
    });
    
    

    app.get('/products', async(req, res)=> {
        const cursor = productsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/products/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productsCollection.findOne(query);
      res.send(result);
    })

        app.delete('/products/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
      
          try {
              const result = await productsCollection.deleteOne(query);
      
              if (result.deletedCount === 1) {
                  res.status(200).json({ success: true, message: 'Product deleted successfully.' });
              } else {
                  res.status(404).json({ success: false, message: 'Product not found.' });
              }
          } catch (error) {
              console.error('Error deleting product:', error);
              res.status(500).json({ success: false, message: 'Failed to delete product.' });
          }
      });


      // users api
      app.post('/users', async(req, res)=> {
        const userInfo = req.body;
        const result = await usersCollection.insertOne(userInfo)
        res.send(result)
      })
      app.get('/users', async(req, res)=> {
        const cursor = usersCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.patch('/users/:id', async (req, res) => {
      const { id } = req.params;
      const { isModerator, isAdmin } = req.body;
  
      try {
          const updateFields = {};
  
          if (isModerator) {
              updateFields.isModerator = true;
              updateFields.isAdmin = false;
          } else if (isAdmin) {
              updateFields.isAdmin = true;
              updateFields.isModerator = false;
          }
  
          const result = await usersCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: updateFields }
          );
  
          if (result.modifiedCount > 0) {
              res.send({ success: true, message: 'User role updated successfully' });
          } else {
              res.status(404).send({ success: false, message: 'User not found or no changes made' });
          }
      } catch (error) {
          console.error('Failed to update user role:', error);
          res.status(500).send({ success: false, message: 'Internal server error' });
      }
  });
  


    // Room Review API
    app.post('/reviews', async(req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    })

    app.get('/reviews', async(req, res)=> {
      const cursor = reviewsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  });

  app.get('/reviews/:id', async(req, res)=> {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await reviewsCollection.findOne(query);
    res.send(result);
  })

    // Add Coupon
app.post('/coupons', async (req, res) => {
  const newCoupon = req.body;
  const result = await couponsCollection.insertOne(newCoupon);
  res.send(result);
});

// Get All Coupons
app.get('/coupons', async (req, res) => {
  const coupons = await couponsCollection.find().toArray();
  res.send(coupons);
});

// Get Single Coupon by ID
app.get('/coupons/:id', async (req, res) => {
  const id = req.params.id;
  const coupon = await couponsCollection.findOne({ _id: new ObjectId(id) });
  res.send(coupon);
});

// Update Coupon
app.put('/coupons/:id', async (req, res) => {
  const id = req.params.id;
  const updatedCoupon = req.body;
  const result = await couponsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCoupon }
  );
  res.send(result);
});

// Delete Coupon
app.delete('/coupons/:id', async (req, res) => {
  const id = req.params.id;
  const result = await couponsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});



    // Post vote
    app.post('/votes', async (req, res) => {
        const { productId, userEmail } = req.body;
    
        // Check if user already voted
        const existingVote = await voteCollection.findOne({ productId, userEmail });
        if (existingVote) {
            return res.status(400).json({ success: false, message: "You already voted for this product." });
        }
    
        // Insert new vote
        const result = await voteCollection.insertOne({ productId, userEmail });
        if (result.insertedId) {
            res.status(200).json({ success: true, message: "Vote added successfully!" });
        } else {
            res.status(500).json({ success: false, message: "Failed to add vote." });
        }
    });
    
    // Get vote count and user status for a product
    app.get('/votes/:id', async (req, res) => {
        const productId = req.params.id;
    
        // Count total votes
        const totalVotes = await voteCollection.countDocuments({ productId });
    
        // Check if the logged-in user voted
        const userEmail = req.query.userEmail;
        const userVoted = userEmail
            ? await voteCollection.findOne({ productId, userEmail }) !== null
            : false;
    
        res.send({ totalVotes, userVoted });
    });
    


      // await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);
  



app.get('/', (req, res) => {
    res.send('Server is running');
})

app.listen(port, ()=> {
    console.log('Server is running on 5000')
})