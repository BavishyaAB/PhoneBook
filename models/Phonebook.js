const mongoose = require('mongoose');
const PhoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

PhoneBookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('PhoneBook', PhoneBookSchema)