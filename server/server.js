require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
const Timer = require('./models/Timer');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// to fetch time from git api
app.get('/api/fork-time', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/pankajexa/fs-assessment/forks`
    );
    
    const myFork = response.data.find(
      fork => fork.owner.login === process.env.GITHUB_USERNAME
    );
    
    if (!myFork) {
      return res.status(404).json({ message: 'Fork not found' });
    }
    
    res.json({ forkTime: myFork.created_at });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fork time' });
  }
});

// to create new timer
app.post('/api/timer', async (req, res) => {
  try {
    const { assessmentStartTime } = req.body;
    const timer = new Timer({
      assessmentStartTime: new Date(assessmentStartTime)
    });
    
    await timer.save();
    res.status(201).json(timer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create the timer' });
  }
});

// to complete timer
app.post('/api/timer/complete', async (req, res) => {
  try {
    const timer = await Timer.findById(req.body.timerId);
    
    if (!timer) {
      return res.status(404).json({ message: 'ID does not exist' });
    }
    
    timer.assessmentEndTime = new Date();
    timer.totalTime = timer.assessmentEndTime - timer.assessmentStartTime;
    timer.status = 'completed';
    
    await timer.save();
    res.json(timer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update the timer' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));