import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Timer = ({}) => {
  const [timer, setTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const apiCalled = useRef(false);
  useEffect(() => {
    if (!timer || isComplete) return;

    const interval = setInterval(() => {
      const start = new Date(timer.assessmentStartTime).getTime();

      const now = new Date().getTime();
      setElapsedTime(now - start);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isComplete]);

  useEffect(() => {
    const initializeTimer = async () => {
      try {
        console.log("triggered");
        // getting fork time
        const { data } = await axios.get("http://localhost:5000/api/fork-time");

        // starting a new timer
        const timerResponse = await axios.post(
          "http://localhost:5000/api/timer",
          {
            assessmentStartTime: data.forkTime,
          }
        );

        setTimer(timerResponse.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (!apiCalled.current) {
      initializeTimer();
      apiCalled.current = true;
    }
  }, []);

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

  const handleComplete = async () => {
    try {
      await axios.post("http://localhost:5000/api/timer/complete", {
        timerId: timer._id,
      });
      setIsComplete(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const time = formatTime(elapsedTime);

  return (
    <div className="bg-gray-900 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg  p-8 w-full max-w-md">
        <h1 className="text-3xl  font-bold text-center mb-6 ">
          Timer Challenge
        </h1>

        <div className="text-6xl text-center mb-8">
          {`${time.hours}:${time.minutes}:${time.seconds}`}
        </div>
        {!isComplete ? (
          <button
            onClick={handleComplete}
            className="w-full text-white rounded-lg py-3 px-6 bg-blue-600 hover:bg-blue-700"
          >
            Complete Challenge
          </button>
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
