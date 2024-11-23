require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const axios = require("axios");
const Timer = require("./models/Timer");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// to create new timer
app.get("/api/timer", async (req, res) => {
  try {
    const isADocumentExisting = await Timer.countDocuments({});
    if (isADocumentExisting > 0) {
      const timer = await Timer.findOne({}).lean();

      if (timer.status !== 'completed') {
        res.status(200).json(timer);
        return;
      } else {
        await Timer.findOneAndDelete({});
      }
    } 

    const response = await axios.get(
      `https://api.github.com/repos/pankajexa/fs-assessment/forks`
    );

    const myFork = response.data.find(
      (fork) => fork.owner.login === process.env.GITHUB_USERNAME
    );

    if (!myFork) {
      return res.status(404).json({ message: "Fork not found" });
    }

    const timer = new Timer({
      assessmentStartTime: new Date(myFork.created_at),
    });

    await timer.save();
    res.status(201).json(timer);
  } catch (error) {
    res.status(500).json({ message: "Failed to create the timer" });
  }
});

// to complete timer
app.post("/api/timer/complete", async (req, res) => {
  try {
    const timer = await Timer.findById(req.body.timerId);

    if (!timer) {
      return res.status(404).json({ message: "ID does not exist" });
    }

    timer.assessmentEndTime = new Date();
    timer.totalTime = timer.assessmentEndTime - timer.assessmentStartTime;
    timer.status = "completed";

    await timer.save();
    res.json(timer);
  } catch (error) {
    res.status(500).json({ message: "Failed to update the timer" });
  }
});

// to pause timer
app.post("/api/timer/pause", async (req, res) => {
  try {
    const timer = await Timer.findById(req.body.timerId);

    if (!timer) {
      return res.status(404).json({ message: "Timer not found" });
    }

    if (timer.isPaused) {
      return res.status(400).json({ message: "Timer is already paused" });
    }

    // Mark the timer as paused and record the pause start time
    timer.isPaused = true;
    timer.pauseStartTime = new Date();
    timer.status = "paused"; // Set status to 'paused'
    timer.lastModified = new Date();

    await timer.save();
    res.status(200).json({ message: "Timer paused successfully", timer });
  } catch (error) {
    res.status(500).json({ message: "Failed to pause the timer" });
  }
});

// to resume timer
app.post("/api/timer/resume", async (req, res) => {
  try {
    const timer = await Timer.findById(req.body.timerId);

    if (!timer) {
      return res.status(404).json({ message: "Timer not found" });
    }

    if (!timer.isPaused) {
      return res.status(400).json({ message: "Timer is not paused" });
    }

    // Calculate the paused duration
    const pauseDuration = new Date() - timer.pauseStartTime;
    timer.totalPausedTime += pauseDuration; // Add the pause duration to totalPausedTime
    timer.isPaused = false;
    timer.pauseStartTime = null;
    timer.status = "in-progress"; // Set status to 'in-progress' when resumed
    timer.lastModified = new Date();

    await timer.save();
    res.status(200).json({ message: "Timer resumed successfully", timer });
  } catch (error) {
    res.status(500).json({ message: "Failed to resume the timer" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
