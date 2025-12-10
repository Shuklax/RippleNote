import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import MetricCard from "./MetricCard";
import RecentSessionsCard from "./RecentSessionsCard";

const metrics = [
  {
    title: "Total Recordings",
    metric: "24"
  },
  {
    title: "Total Duration",
    metric: "42h 30m"
  },
  {
    title: "This Month",
    metric: "8"
  }
]

const sessions = [
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
  {
    title: "Team Interview",
    date: "Nov 11, 2024",
    duration: "1h 24m",
    participants: "3",
  },
]

const Dashboard = () => {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div id="header" className="flex justify-between p-6 border border-[#131313] bg-[#060606]">
        <div>
          <p className="text-2xl font-bold">DashBoard</p>
          <p className="text-sm text-gray-500">
            Welcome back! Here's your recording studio
          </p>
        </div>
        <div className="content-center">
          <NavLink to="/create" className="font-semibold hover:bg-[#3266ec] bg-[#3e70ee] p-2 rounded-lg">
            <Plus className="inline mr-2" size={17}/>
            Create New Sessions
          </NavLink>
        </div>
      </div>
      <div id="metrics" className="grid grid-cols-9 gap-6 ml-4 mt-4 mr-4 mb-8">
        {metrics.map((item, index)=> (
          <MetricCard key={index} {...item}/>
        ))}
      </div>
      <div id="recent-sessions" className="py-4 px-4 flex-1 overflow-auto">
        <p className="text-2xl font-bold px-2 mb-4">Recent Sessions</p>
        <div className="flex flex-col overflow-hidden space-y-4">
          {sessions.map((item, index)=> (
            <RecentSessionsCard key={index} {...item}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
