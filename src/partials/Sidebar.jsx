import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../images/Logo.svg";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Close on ESC key
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  // Persist sidebar expanded state
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.body.classList.add("sidebar-expanded");
    } else {
      document.body.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  // Helper for setting active styles
  const getActiveStyles = (isActive) =>
    `pl-4 pr-3 py-[14px] rounded-r-[28px] mb-2 last:mb-0 ${
      isActive ? 'bg-white-wash' : ''
    }`;

  const getIconBoxStyles = (isActive) =>
    `rounded-[8px] p-1 px-2 ${isActive ? 'bg-sherwood-950' : ''}`;

  const getIconColor = (isActive) =>
    isActive ? 'text-white' : 'text-sherwood-950/60';

  const getTextColor = (isActive) =>
    `text-[16px] font-semibold ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 ${
      isActive ? 'text-sherwood-950' : 'text-sherwood-950/60'
    }`;

  return (
    <div className="min-w-fit">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${
          variant === "v2"
            ? "border-r border-gray-200 dark:border-gray-700/60"
            : "rounded-r-[28px] shadow-lg"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col items-start gap-4 mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <NavLink to="/dashboard" className="block text-center">
            <img src={logo} alt="Logo" className="w-42 h-24" />
          </NavLink>
        </div>

        {/* Nav Items */}
        <div className="space-y-8">
          <ul className="mt-3">
            {/* Dashboard */}
             <li className={getActiveStyles(pathname.includes("dashboard"))}>
              <NavLink to="/dashboard" className="block text-gray-800 dark:text-gray-100">
                <div className="flex items-center">
                  <div className={getIconBoxStyles(pathname.includes("dashboard"))}>
                    <i className={`fa-solid fa-house ${getIconColor(pathname.includes("dashboard"))}`}></i>
                  </div>
                  <span className={getTextColor(pathname.includes("dashboard"))}>Dashboard</span>
                </div>
              </NavLink>
            </li>

            {/* Master Data */}
            <li className={getActiveStyles(pathname.includes("master-data"))}>
              <NavLink to="/master-data" className="block text-gray-800 dark:text-gray-100">
                <div className="flex items-center">
                  <div className={getIconBoxStyles(pathname.includes("master-data"))}>
                    <i className={`fa-solid fa-folder-open ${getIconColor(pathname.includes("master-data"))}`}></i>
                  </div>
                  <span className={getTextColor(pathname.includes("master-data"))}>Master Data</span>
                </div>
              </NavLink>
            </li>

            {/* Transaction */}
            <li className={getActiveStyles(pathname.includes("transaction"))}>
              <NavLink to="/transaction" className="block text-gray-800 dark:text-gray-100">
                <div className="flex items-center">
                  <div className={getIconBoxStyles(pathname.includes("transaction"))}>
                    <i className={`fa-solid fa-money-bill-transfer ${getIconColor(pathname.includes("transaction"))}`}></i>
                  </div>
                  <span className={getTextColor(pathname.includes("transaction"))}>Transaction</span>
                </div>
              </NavLink>
            </li>

            {/* Report */}
            <li className={getActiveStyles(pathname.includes("report"))}>
              <NavLink to="/report" className="block text-gray-800 dark:text-gray-100">
                <div className="flex items-center">
                  <div className={getIconBoxStyles(pathname.includes("report"))}>
                    <i className={`fa-solid fa-file-lines ${getIconColor(pathname.includes("report"))}`}></i>
                  </div>
                  <span className={getTextColor(pathname.includes("report"))}>Report</span>
                </div>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Collapse Button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-[14px]">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current sidebar-expanded:rotate-180" width="16" height="16" viewBox="0 0 16 16">
                <path d="M4.293 5.293a1 1 0 0 1 1.414 0L8 7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
