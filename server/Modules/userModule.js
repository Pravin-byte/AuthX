const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  task: String,
  done:{
    type:Boolean,
    default:false
  },
  description: String,
});

const TodoModel = mongoose.model('todos', TodoSchema);
module.exports = TodoModel;
