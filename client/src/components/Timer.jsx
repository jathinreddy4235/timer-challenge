import React, { useState, useEffect } from "react";
import axios from "axios";

const Timer = () => {
  const [timer, setTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch the timer data from the backend when the component mounts
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/timer");
        const timerData = response.data;

        // Calculate the elapsed time considering the pause durations
        const start = new Date(timerData.assessmentStartTime).getTime();
        const now = Date.now();
        const pausedTime = timerData.totalPausedTime || 0;

        let totalElapsedTime = now - start - pausedTime;

        setTimer(timerData);
        setIsPaused(timerData.isPaused);
        setIsComplete(timerData.status === "completed");

        if (
          timerData.status === "in-progress" ||
          timerData.status === "paused"
        ) {
          setElapsedTime(totalElapsedTime);
        }
      } catch (error) {
        console.error("Error initializing the timer:", error);
      }
    };

    initializeTimer();
  }, []);

  // Start an interval to update elapsed time if the timer is in-progress
  useEffect(() => {
    let interval;
    if (timer && timer.status === "in-progress" && !isPaused && !isComplete) {
      interval = setInterval(() => {
        const start = new Date(timer.assessmentStartTime).getTime();
        const now = Date.now();
        const totalPausedTime = timer.totalPausedTime || 0;

        // Recalculate the elapsed time, accounting for the total paused time
        setElapsedTime(now - start - totalPausedTime);
      }, 1000);
    }

    // Clean up interval on unmount or when status changes
    return () => clearInterval(interval);
  }, [timer, isPaused, isComplete]);

  // Format the time into HH:MM:SS
  const formatTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);
    return {
      hours: String(hrs).padStart(2, "0"),
      minutes: String(min % 60).padStart(2, "0"),
      seconds: String(sec % 60).padStart(2, "0"),
    };
  };

  // Handle completion of the timer
  const handleComplete = async () => {
    try {
      const resp = await axios.post(
        "http://localhost:5000/api/timer/complete",
        {
          timerId: timer._id,
        }
      );
      setIsComplete(true);
      setTimer(resp.timer);
    } catch (error) {
      console.error("Error completing the timer:", error);
    }
  };

  // Handle pausing the timer
  const handlePause = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/timer/pause",
        {
          timerId: timer._id,
        }
      );

      setIsPaused(true);
      setTimer(response.data.timer);
    } catch (error) {
      console.error("Error pausing the timer:", error);
    }
  };

  // Handle resuming the timer
  const handleResume = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/timer/resume",
        {
          timerId: timer._id,
        }
      );

      setIsPaused(false);
      setTimer(response.data.timer);
    } catch (error) {
      console.error("Error resuming the timer:", error);
    }
  };

  // Handle deleting the timer
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/timer`);
      setTimer(null); // Clear the timer state
      setIsPaused(false);
      setIsComplete(false);
      alert("Timer has been deleted successfully.");
    } catch (error) {
      console.error("Error deleting the timer:", error);
      alert("Failed to delete the timer.");
    }
  };

  const time = formatTime(elapsedTime);

  return (
    <div className="bg-gray-900 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Timer Challenge</h1>

        <div className="text-6xl text-center mb-8">
          {`${time.hours}:${time.minutes}:${time.seconds}`}
        </div>

        {!isComplete ? (
          <div>
            {isPaused ? (
              <button
                onClick={handleResume}
                className="w-full text-white rounded-lg py-3 px-6 bg-blue-600 hover:bg-blue-700"
              >
                Resume Timer
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-full text-white rounded-lg py-3 px-6 bg-blue-600 hover:bg-blue-700"
              >
                Pause Timer
              </button>
            )}
            <button
              onClick={handleComplete}
              className="w-full text-white rounded-lg py-3 px-6 bg-green-600 hover:bg-green-700 mt-4"
            >
              Complete Challenge
            </button>
          </div>
        ) : (
          <div className="text-center text-green-600 font-semibold">
            Challenge Completed!
          </div>
        )}

        {timer && (
          <div>
            <div className="text-gray-600 mt-4 text-sm">
              <p>
                Start Time:{" "}
                {new Date(timer.assessmentStartTime).toLocaleString()}
              </p>
              {isComplete && (
                <p>
                  End Time: {new Date(timer.assessmentEndTime).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;
