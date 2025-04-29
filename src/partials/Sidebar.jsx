import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../images/Logo.svg";
import SidebarLinkGroup from "./SidebarLinkGroup";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-[28px] shadow-lg'}`}
      >
        {/* Sidebar header */}
        <div className="flex flex-col items-start gap-4 mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/" className="block text-center">
            <img src={logo} alt="Logo" className="w-42 h-24" />
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <ul className="mt-3">
              {/* Dashboard */}
              {/* Dashboard */}
              <li className={`pl-4 pr-3 py-[14px] rounded-r-[28px] mb-0.5 last:mb-0 ${pathname === '/' ? 'bg-white-wash' : ''}`}>
                <NavLink
                  end
                  to="/"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname === '/' ? "" : "hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-[8px] p-1 ${pathname === '/' ? 'bg-sherwood-950' : ''}`}>
                        <i className={`fa-solid fa-house shrink-0 ${pathname === '/' ? 'text-white' : 'text-sherwood-950/60'}`} width="16" height="16" viewBox="0 0 16 16"></i>
                      </div>
                      <span className={`text-[16px] font-semibold ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 ${pathname === '/' ? 'text-sherwood-950' : 'text-sherwood-950/60'}`}>
                        Dashboard
                      </span>
                    </div>
                  </div>
                </NavLink>
              </li>

              {/* Master Data */}
              <li className={`pl-4 pr-3 py-[14px] rounded-r-[28px] mb-0.5 last:mb-0 bg-linear-to-r ${pathname.includes("master-data") && 'bg-white-wash'}`}>
                <NavLink
                  end
                  to="/master-data"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.includes("master-data") ? "" : "hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-[8px] p-1 ${pathname.includes("master-data") ? 'bg-sherwood-950' : ''}`}>
                        <i className={`fa-solid fa-folder-open shrink-0 ${pathname.includes("master-data") ? 'text-white' : 'text-sherwood-950/60'}`} width="16" height="16" viewBox="0 0 16 16"></i>
                      </div>
                      <span className={`text-[16px] font-semibold ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 ${pathname.includes("master-data") ? 'text-sherwood-950' : 'text-sherwood-950/60'}`}>
                        Master Data
                      </span>
                    </div>
                  </div>
                </NavLink>
              </li>
              {/* Transaction */}
              <li className={`pl-4 pr-3 py-[14px] rounded-r-[28px] mb-0.5 last:mb-0 bg-linear-to-r ${pathname.includes("transaction") && 'bg-white-wash'}`}>
                <NavLink
                  end
                  to="/transaction"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.includes("transaction") ? "" : "hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-[8px] p-1 ${pathname.includes("transaction") ? 'bg-sherwood-950' : ''}`}>
                        <i className={`fa-solid fa-money-bill-transfer shrink-0 ${pathname.includes("transaction") ? 'text-white' : 'text-sherwood-950/60'}`} width="16" height="16" viewBox="0 0 16 16"></i>
                      </div>
                      <span className={`text-[16px] font-semibold ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 ${pathname.includes("transaction") ? 'text-sherwood-950' : 'text-sherwood-950/60'}`}>
                        Transaction
                      </span>
                    </div>
                  </div>
                </NavLink>
              </li>
              {/* Report */}
              <li className={`pl-4 pr-3 py-[14px] rounded-r-[28px] mb-0.5 last:mb-0 bg-linear-to-r ${pathname.includes("report") && 'bg-white-wash'}`}>
                <NavLink
                  end
                  to="/report"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.includes("report") ? "" : "hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-[8px] p-1 ${pathname.includes("report") ? 'bg-sherwood-950' : ''}`}>
                        <i className={`fa-solid fa-file-lines shrink-0 ${pathname.includes("report") ? 'text-white' : 'text-sherwood-950/60'}`} width="16" height="16" viewBox="0 0 16 16"></i>
                      </div>
                      <span className={`text-[16px] font-semibold ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 ${pathname.includes("report") ? 'text-sherwood-950' : 'text-sherwood-950/60'}`}>
                        Report
                      </span>
                    </div>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-[14px]">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M4.293 5.293a1 1 0 0 1 1.414 0L8 7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
