import React, { useState } from "react";
import Home from "./Home";
import NewProject from "./NewProject";
import ProjectAnalysis from "./ProjectAnalysis";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const tabList = [
    { key: "home", label: "Home" },
    { key: "new_project", label: "New Project" },
    { key: "project_analysis", label: "Project Analysis" },
    { key: "result", label: "Result" },
  ];

  return (
    <div className="mx-auto p-3">
      <div className="w-full bg-orange-500 rounded-lg flex justify-center items-center mt-4">
        <ul className="flex w-full">
          {tabList.map((tab) => (
            <li key={tab.key} className="flex-1">
              <button
                className={`w-full p-[3px] font-bold rounded-lg
                  ${
                    activeTab === tab.key
                      ? "bg-white text-orange-500 m-1"
                      : "bg-orange-500 text-white m-1"
                  }
                `}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4">
        {activeTab === "home" && <Home />}
        {activeTab === "new_project" && <NewProject />}
        {activeTab === "project_analysis" && <ProjectAnalysis />}
        {activeTab === "result" && <div className="text-center text-2xl text-orange-500">this tab is under devlopment</div>}
      </div>
    </div>
  );
}

export default App;