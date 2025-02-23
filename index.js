const express = require('express')
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

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

  // Room Review API
  app.post('/coupons', async(req, res) => {
    const newReview = req.body;
    const result = await couponsCollection.insertOne(newReview);
    res.send(result);
  })

  app.get('/coupons', async(req, res)=> {
    const cursor = couponsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
});

app.get('/coupons/:id', async(req, res)=> {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await couponsCollection.findOne(query);
  res.send(result);
})


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