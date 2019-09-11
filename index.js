const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express()


const stringifyBody = (req, res) => {
  return JSON.stringify(req.body);
}

morgan.token('stringBody', (req, res) => stringifyBody(req, res));
// define 'tiny' morgan format with own addition
const morganFormat = ':method :url :status :res[content-length] - :response-time ms - :stringBody'
app.use(morgan(morganFormat));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());

const persons = [
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    },
    {
      "name": "sdadf",
      "number": "adsfadsf",
      "id": 5
    }
];

const getNewId = () => {
  function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  const randomNumber = getRandomFloat(10, 65536);
  return Math.floor(randomNumber);
}

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.post('/api/persons', (req, res) => {
  const { body } = req;
  if (!body.name || !body.number) {
    return res.status(400).send('Body should include fields "name" and "number"');
  }
  const personFound = persons.find(element => element.name === body.name);
  if (personFound) {
    return res.status(400).send({
      error: `Person with name ${body.name} already exists`,
    });
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: getNewId(), 
  };
  persons.push(newPerson);

  res.json(newPerson);
  
});

app.delete('/api/persons/:id', (req, res) => {
  const numberId = Number(req.params.id);
  const index = persons.findIndex(element => element.id === numberId);
  console.log('index of person:', index);
  if (index > -1) {
    persons.splice(index, 1); // splice in-place, not the best idea but works for now
    return res.status(204).send();
  }
  res.status(404).send();
});

app.get('/api/persons/:id', (req, res) => {
  const numberId = Number(req.params.id);
  const person = persons.find(element => element.id === numberId);
  if (person) {
    return res.json(person);
  }
  res.status(404).send();
  
});

app.get('/api/info', (req, res) => {
  let htmlResponse = `<p>Phonebook has info on ${persons.length} people</p>`
  htmlResponse = `${htmlResponse}<br>`
  htmlResponse = `${htmlResponse} ${(new Date()).toString()}`;
  res.send(htmlResponse);
});

// const port = 3001
const port = process.env.PORT || 3001;
app.listen(port)
console.log(`Server running on port ${port}`)