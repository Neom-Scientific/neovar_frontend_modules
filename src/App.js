import React, { useEffect, useState } from "react";
import Home from "./Home";
import NewProject from "./NewProject";
import ProjectAnalysis from "./ProjectAnalysis";
import Cookies from "js-cookie"
import Auth from "./Auth";
import Header from "./Header";
import Help from "./Help";
import Reports from "./Reports";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [User, setUser] = useState(null);

  useEffect(() => {
    const user = Cookies.get('neovar_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUser(parsedUser);
    }
  }, [])

  if (!User) {
    return <Auth />;
  }

  const tabList = [
    { key: "home", label: "Home" },
    { key: "new_project", label: "New Project" },
    { key: "project_analysis", label: "Project Analysis" },
    { key: "result", label: "Result" },
    { key: "help", label: "Help" },
  ];

  return (
    <>
      <Header />
      <div className="mx-auto p-3">
        <div className="w-full bg-orange-500 rounded-lg flex justify-center items-center mt-4">
          <ul className="flex w-full">
            {tabList.map((tab) => (
              <li key={tab.key} className="flex-1">
                <button
                  className={`w-full p-[3px] font-bold rounded-lg
                  ${activeTab === tab.key
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
          {activeTab === "new_project" && <NewProject onShowAnalysis={() => setActiveTab('project_analysis')} />}
          {activeTab === "project_analysis" && <ProjectAnalysis />}
          {activeTab === "result" && <Reports />}
          {activeTab === "help" && <Help />}
        </div>
      </div>
    </>
  );
}

export default App;