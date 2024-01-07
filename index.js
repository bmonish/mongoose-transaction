const express = require("express");
const mongoose = require("mongoose");
const User = require("./User.model");
const Task = require("./Task.model");

const app = express();
app.use(express.json());

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  process.exit(-1);
});

const CONNECTION_STRING = "";

mongoose.connect(CONNECTION_STRING).then(() => {
  console.log("Connected to MongoDB");
});

app.get("/status", (req, res) => {
  res.json({ status: "OK! Running" });
});

app.post("/create-user", async (req, res) => {
  const user = new User({
    ...req.body,
  });

  const savedUser = await user.save();
  res.json(savedUser);
});

app.post("/create-todo", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newTask = await createTask(req.body, session);
    console.log("Task", newTask);
    const taskId = newTask._id;
    const userId = newTask.userId;

    if (newTask.name.startsWith("fail")) {
      throw new Error("Dummy Error");
    }

    await updateUser(userId, taskId, session);

    await session.commitTransaction();
    session.endSession();

    console.log("Transaction committed successfully.");
    res.json({ taskId });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log("Transaction aborted", err);
    res.json({ error: err.message });
  }
});

const createTask = async (taskData, session) => {
  const newTask = new Task(taskData);
  return await newTask.save({ session });
};

const updateUser = async (userId, taskId, session) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { lastTask: taskId } },
    { session, new: true }
  );
  console.log("Updated User", updatedUser);
  return updatedUser;
};

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
