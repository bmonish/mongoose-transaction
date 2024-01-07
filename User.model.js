const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  noOfTasks: {
    type: Number,
  },
  lastTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
});

module.exports = mongoose.model("User", userSchema);
