const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

if (!url) {
  console.error('MONGODB_URI env var not set, exiting...');
  process.exit(1);
}

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to Mongodb at url', process.env.MONGODB_URI);
  })
  .catch((err) => {
    console.log('Error connecting to Mongodb:', err.message);
  });


const personSchema = new mongoose.Schema({
  name: {
    type: String, unique: true, required: true, minlength: 3,
  },
  number: { type: String, required: true, minlength: 8 },
});

// transform the object to form suitable for frontend
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const copy = { ...returnedObject };
    copy.id = returnedObject._id.toString(); // eslint-disable-line
    delete copy._id; // eslint-disable-line
    delete copy.__v; // eslint-disable-line
    return copy;
  },
});

personSchema.plugin(uniqueValidator);

const Person = mongoose.model('Person', personSchema);

module.exports = Person;
