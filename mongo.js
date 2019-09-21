/**
 * Test file for trying out mongodb stuff
 */

const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const [thisFile, curdir, password, personName, personNumber] = process.argv; // eslint-disable-line

const url = `mongodb+srv://test_user:${password}@cluster0-uvq1n.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
});

const Person = mongoose.model('Person', personSchema);

if (personName && personNumber) {
  const person = new Person({ name: personName, number: personNumber });
  person
    .save()
    .then(() => {
      console.log(`Added ${personName} number ${personNumber} to phonebook`);
      mongoose.connection.close();
    });
} else {
  Person
    .find({})
    .then((peopleRes) => {
      const people = peopleRes.map((person) => person.toJSON());
      console.log('Phonebook:');
      people.forEach((person) => console.log(`${person.name}  ${person.number}`));
      mongoose.connection.close();
    });
}
