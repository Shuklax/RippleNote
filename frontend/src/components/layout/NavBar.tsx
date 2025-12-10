import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="text-3xl font-bold p-5 border border-[#131313]">
          RecordHub
        </div>
        <div className="flex flex-col mt-4 mx-4 space-y-4 font-semibold text-lg content-start">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block hover:bg-[#222222] text-left py-2 px-6 rounded-lg ${
                isActive ? "bg-[#3e70ee]" : "hover:bg-[#222222]"
              }`
            }
          >
            DashBoard
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) =>
              `block text-left py-2 px-6 rounded-lg ${
                isActive ? "bg-[#3e70ee]" : "hover:bg-[#222222]"
              }`
            }
          >
            Create Sessions
          </NavLink>

          <NavLink
            to="/recordings"
            className={({ isActive }) =>
              `block text-left py-2 px-6 rounded-lg ${
                isActive ? "bg-[#3e70ee]" : "hover:bg-[#222222]"
              }`
            }
          >
            Recordings
          </NavLink>

          <NavLink
            to="/summaries"
            className={({ isActive }) =>
              `block text-left py-2 px-6 rounded-lg ${
                isActive ? "bg-[#3e70ee]" : "hover:bg-[#222222]"
              }`
            }
          >
            Summaries
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `block text-left py-2 px-6 rounded-lg ${
                isActive ? "bg-[#3e70ee]" : "hover:bg-[#222222]"
              }`
            }
          >
            Profile
          </NavLink>
        </div>
      </div>

      <div className="flex border border-[#131313] p-4 justify-center space-x-2">
        <div className="py-2 px-3 font-bold rounded-full bg-[#3e70ee]">JD</div>
        <div className="flex flex-col">
          <p className="font-semibold">John Doe</p>
          <p className="text-sm text-gray-500">john@example.com</p>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
