const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const e = require('express');
const app = express();
dotenv.config();
const MAX_ID = 10000;
const persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
const generateId = () => {
    const min = persons.length + 1;
    return (Math.floor(Math.random() * (MAX_ID-min))+min);
}
app.use(express.static('dist'))
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token('body', function(req,res) {
    return JSON.stringify(req.body);
});
app.get('/', (req, res) => {    console.log('PhoneBook App')});
app.get('/info', (req, res) => {
  const timestamp = new Date();
  console.log(timestamp);
  res.send(`Phonebook has info for ${persons.length} people <br>${timestamp}`);
});
app.get('/api/persons', (req, res) => {
    res.json(persons);
});
app.get('/api/persons/:id',(req,res)=>{
    const id  = req.params.id;
    const person = persons.find(p => p.id === id);
    if (person) {
        res.json(person);
    } else {
        res.status(404).send({ error: 'Person not found' });
    }
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
    const { name, number } = req.body;
    if (!name || !number) {
        return res.status(400).send({ error: 'Name and number are required' });
    }
    if (persons.find(p => p.name === name)) {
        console.log('Name must be unique');
        return res.status(400).send({ error: 'Name must be unique' });
    }
    const newPerson = {
        id: String(generateId()),
        name,
        number
    };
    console.log(newPerson);
    persons.push(newPerson);
    res.status(200).json(newPerson);
})
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
