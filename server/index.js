const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());
app.use(cors());

async function connectToMongoDB() {
  try {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@appomtment.o8pnvem.mongodb.net/${process.env.DB_NAME}`;

    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Connected to MongoDB');

    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function run() {
  try {
    const client = await connectToMongoDB();
    const db = client.db('doctorsPortal');
    const appointmentsCollection = db.collection('appoints');

    app.post('/addAppointment', (req, res) => {
      const appointment = req.body;
      appointmentsCollection.insertOne(appointment)
        .then(result => {
          res.send(result.insertedCount > 0);
        })
        .catch(error => {
          console.error('Error inserting appointment:', error);
          res.status(500).send('Error inserting appointment');
        });
    });

    app.post('/appointmentsByDate', (req, res) => {
      const date = req.body;
      appointmentsCollection.find({ date: date.date })
        .toArray((err, documents) => {
          if (err) {
            console.error('Error retrieving appointments by date:', err);
            res.status(500).send('Error retrieving appointments by date');
          } else {
            res.send(documents);
          }
        });
    });

    app.post('/addADoctor', (req, res) => {
      const file = req.files.file;
      const email = req.body.email;
      const name = req.body.name;
      console.log(name, file, email);
      appointmentsCollection.insertOne(file, email, name)
        .then(result => {
          res.send(result.insertedCount > 0);
        });
      file.mv(`${__dirname}/doctors/${file.name}`, err => {
        if (err) {
          console.log(err);
          return res.status(500).send({ msg: 'Failed to upload Image' });
        }
        appointmentsCollection.insertOne({ name, email, img: file.name })
          .then(result => {
            res.send(result.insertedCount > 0);
          });
        // return res.send({name: file.name, Path:`/${file.name}`});
      })
    });

    app.get('/doctors', (res, req) => {
      appointmentsCollection.find({ name: file.name })
      toArray((err, documents) => {
        res.send(documents);
      })
    })

  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(4200, () => {
  console.log('Server is running on port 4200');
});