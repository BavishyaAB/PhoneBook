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
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}
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
app.get('/api/persons/:id',(req,res,next)=>{
    const id  = req.params.id;
    PhoneBook.findById(id).then(person => {
      if (person) {
          res.json(person);
      } else {
          res.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(err => {
      next(err);
    });
});
app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send({ error: 'ID is required' });
    }
    PhoneBook.findByIdAndDelete(id)
        .then(() => {
            res.status(204).end();
        })
        .catch(err => {
            next(err);
        });
});
app.post('/api/persons', (req, res, next) => {
    console.log('logging incoming request', req.body);
    const body = req.body;
    if(!body.name || !body.number) {
        return res.status(400).send({ error: 'Request Body Missing' });
    }
    const newPerson = new PhoneBook({ name:body.name, number:body.number });
    // PhoneBook.findOne({ name: body.name }).then(existingPerson => { 
    //     if (existingPerson) {
    //         console.log('Name must be unique');
    //         return res.status(400).send({ error: 'Name must be unique' });
    //     }   
    // });
    console.log('logging new person', newPerson);
    newPerson.save().then(savedPerson => {
        res.status(200).json(savedPerson);
    }).catch(err => {
        console.error('Error saving person:', err);
        next(err);
    });
})
app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    console.log('logging incoming request', body)
    PhoneBook.findByIdAndUpdate(id, body, { new: true })
        .then(updatedPerson => {
            if (updatedPerson) {
                res.json(updatedPerson);
            } else {
                res.status(404).send({ error: 'Person not found' });
            }
        })
        .catch(err => {
            next(err);
        });
});
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
mongoose.connect(url)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});