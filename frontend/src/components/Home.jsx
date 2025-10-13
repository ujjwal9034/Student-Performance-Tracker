import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4" style={{backgroundColor:"#ffffffff" }}>
      
      <h1 className="text-black text-4xl md:text-5xl font-bold text-gray-800 mb-6 text-center">
        Student Performance Tracker
      </h1>

      <p className="text-black text-gray-600 text-center max-w-xl ">
        Track your attendance, grades, and performance easily. Teachers can manage
        students and their progress, while students can monitor their own
        performance in real-time.
      </p>

      
    </div>
  );
};

export default Home;
