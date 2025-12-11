import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import NavBar from "./components/layout/NavBar";
import CreateSessions from "./components/CreateSessions";
import Recordings from "./components/Recordings";
import Summaries from "./components/Summaries";
import Profile from "./components/Profile";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <div className="flex-1 h-full bg-[#030303] text-white border border-[#131313]">
          <NavBar />
        </div>

        <div className="flex-[5] h-full bg-[#020202] text-white">
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/create" element={<CreateSessions />}/>
            <Route path="/recordings" element={<Recordings />}/>
            <Route path="/summaries" element={<Summaries />}/>
            <Route path="/profile" element={<Profile />}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
