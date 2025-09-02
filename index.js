const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const PhoneBook = require('./models/Phonebook');
const mongoose = require('mongoose');
const url = process.env.MONGODB_URI;
mongoose.set("strictQuery", false);

app.use(express.static('dist'))
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token('body', function(req,res) {
    return JSON.stringify(req.body);
});

app.get('/', (req, res) => {console.log('PhoneBook App')});
app.get('/info', (req, res) => {
  const timestamp = new Date();
  console.log(timestamp);
    PhoneBook.find({}).then(persons => {
      res.send(`Phonebook has info for ${persons.length} people <br>${timestamp}`);
    });
});
app.get('/api/persons', (req, res) => {
    PhoneBook.find({}).then(persons => {
      res.json(persons);
    });
});
app.get('/api/persons/:id',(req,res)=>{
    const id  = req.params.id;
    PhoneBook.findById(id).then(person => {
      if (person) {
          res.json(person);
      } else {
          res.status(404).send({ error: 'Person not found' });
      }
    });
});
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send({ error: 'ID is required' });
    }
    const personIndex = persons.findIndex(p => p.id === id);
    if (personIndex !== -1) {
        persons.splice(personIndex, 1);
        console.log(persons);
        res.status(204).json(persons);
    } else {
        res.status(404).send({ error: 'Person not found' });
    }
});
app.post('/api/persons', (req, res) => {
    console.log(req.body);
    const body = req.body;
    if(!body) {
        return res.status(400).send({ error: 'Content is missing' });
    }
    const newPerson = new PhoneBook({ name:body.name, number:body.number });
    if (!body.name || !body.number) {
        return res.status(400).send({ error: 'Name and number are required' });
    }
    // if (persons.find(p => p.name === name)) {
    //     console.log('Name must be unique');
    //     return res.status(400).send({ error: 'Name must be unique' });
    // }
    console.log(newPerson);
    newPerson.save().then(savedPerson => {
      res.status(200).json(savedPerson);
    });
})
const PORT = process.env.PORT || 3001;

mongoose.connect(url)
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
        });
