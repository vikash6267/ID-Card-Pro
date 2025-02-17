import React from 'react';
import Link from 'next/link';
import { FaBuilding, FaHome } from 'react-icons/fa';
import { FaChartBar, FaUserCircle, FaUsers } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="hidden md:flex bg-indigo-50 dark:bg-gray-800">
      <aside
        id="default-sidebar"
        className="top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-4 font-medium">
            <li>
              <Link
                href="/"
                className="flex items-center p-3 text-indigo-700 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaHome className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Home</span>
              </Link>
              <Link
                href="/Admin/Dashbord"
                className="flex items-center p-3 text-indigo-700 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaChartBar className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/Admin/Distributors"
                className="flex items-center p-3 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaUsers className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Distributors</span>
              </Link>
            </li>
            <li>
              <Link
                href="/Admin/Schools"
                className="flex items-center p-3 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaBuilding className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Schools</span>
              </Link>
            </li>
            <li>
              <Link
                href="/Admin/report"
                className="flex items-center p-3 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaUserCircle className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Distibutor Report</span>
              </Link>
            </li>
            <li>
              {/* <Link
                href="/Admin/Students"
                className="flex items-center p-3 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaUsers className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Students</span>
              </Link> */}
            </li>
            <li>
              <Link
                href="/Admin/ChangeLimits"
                className="flex items-center p-3 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaChartBar className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Change Limits</span>
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center p-3 rounded-lg dark:text-white hover:bg-indigo-200 dark:hover:bg-gray-700 group"
              >
                <FaUsers className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                <span className="ml-3 text-indigo-600">Home</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
