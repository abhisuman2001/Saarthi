// src/components/Navbar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "../logo.png";

interface NavItem {
  name: string;
  path?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const patid = searchParams.get("patid");
  const docid = searchParams.get("docid");

  let navItems: NavItem[] = [];

  const handleLogout = () => {
    navigate("/");
  };

  if (location.pathname.startsWith("/patient")) {
    navItems = [{ name: "Logout", onClick: handleLogout, icon: <LogOut size={18} /> }];
  } else if (location.pathname.startsWith("/doctor")) {
    navItems = [
      { name: "Dashboard", path: `/doctor/dashboard?docid=${docid}`, icon: <ClipboardList size={20} /> },
      { name: "Logout", onClick: handleLogout, icon: <LogOut size={18} /> },
    ];
  } else {
    navItems = [
      { name: "Login", path: "/login" },
      { name: "Signup", path: "/register" },
    ];
  }

  const isActive = (itemPath?: string) => {
    if (!itemPath) return false;
    return location.pathname === itemPath.split("?")[0];
  };

  const handleLogoClick = () => {
    if (location.pathname.startsWith("/patient") && patid) {
      navigate(`/patient/homepage?patid=${patid}`);
    } else if (location.pathname.startsWith("/doctor") && docid) {
      navigate(`/doctor/dashboard?docid=${docid}`);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-md z-50 border-b border-gray-800/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
        {/* Logo */}
        <div className="cursor-pointer flex items-center space-x-3" onClick={handleLogoClick}>
          <img src={Logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-gray-800 font-medium text-lg tracking-wide">ORTHO SAARTHI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) =>
            item.path ? (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 text-gray-700 transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-gray-900 font-semibold border-b-2 border-gray-900 pb-1"
                    : "hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ) : (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex items-center gap-2 text-gray-700 font-medium hover:underline"
              >
                {item.icon}
                {item.name}
              </button>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex space-x-2 items-center">
          {navItems.map((item) =>
            item.path ? (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center px-2 py-1 rounded text-sm transition-all duration-200 ${
                  isActive(item.path) ? "text-gray-900 font-semibold" : "text-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`flex flex-col items-center px-2 py-1 rounded text-sm transition-all duration-200 ${
                  isActive(item.path) ? "text-gray-900 font-semibold" : "text-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
