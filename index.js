require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

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
app.use(express.static('build'));


app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(people => {
      const response = people.map(person => person.toJSON());
      res.json(response);
    });
});

app.post('/api/persons', (req, res, next) => {
  const { body } = req;
  if (!body.name || !body.number) {
    return res.status(400).send('Body should include fields "name" and "number"');
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });
  newPerson.save()
    .then(savedPerson => {
      console.log(savedPerson);
      res.json(savedPerson.toJSON());
    })
    .catch(err => next(err));
  
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).send();
    })
    .catch(err => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;
  if (!name || !number) {
    return res.status(400).send('Body should include fields "name" and "number"');
  }

  const personUpdates = { name, number };

  Person.findByIdAndUpdate(req.params.id, personUpdates, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON());
    })
    .catch(err => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person.toJSON());
      else res.status(404).send();
    })
    .catch(err => next(err));
});

app.get('/api/info', (req, res, next) => {
  Person.find({})
    .then(people => {
      let htmlResponse = `<p>Phonebook has info on ${people.length} people</p>`
      htmlResponse = `${htmlResponse}<br>`
      htmlResponse = `${htmlResponse} ${(new Date()).toString()}`;
      res.send(htmlResponse);
    })
    .catch(err => next(err));
});

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  // MongoDB id errors
  if (err.name === 'CastError' && err.kind == 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  if(err.name === 'ValidationError') {
    return res.status(400).send({error: err.message});
  }

  next(err);
}

app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port)
console.log(`Server running on port ${port}`)