const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

if (!url) {
  console.error('MONGODB_URI env var not set, exiting...');
  process.exit(1);
}

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(result => {
    console.log('connected to Mongodb at url', process.env.MONGODB_URI);
  })
  .catch(err => {
    console.log('Error connecting to Mongodb:', err.message);
  });


const personSchema = new mongoose.Schema({
  name: {type: String, unique: true, required: true},
  number: {type: String, required: true},
});

// transform the object to form suitable for frontend
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete _id & version field from the object
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

personSchema.plugin(uniqueValidator);

const Person = mongoose.model('Person', personSchema);

module.exports = Person;