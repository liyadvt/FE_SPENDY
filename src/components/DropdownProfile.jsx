import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';
import axiosInstance from '../partials/axiosInstance';

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const trigger = useRef(null);
  const dropdown = useRef(null);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Close on outside click
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close on Escape key
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <div className="flex flex-col text-right ml-2 truncate">
          <span className="text-base font-semibold text-sherwood-950 font-montserrat group-hover:text-sherwood-800">
            {user?.name || 'Loading...'}
          </span>
        </div>

        {/* Icon Font Awesome */}
        <i className="fa-solid fa-user ml-2 text-2xl text-[#10141C]/60"></i>

        <svg
          className="w-3 h-3 ml-2 shrink-0 fill-current text-[#10141C]/60"
          viewBox="0 0 12 12"
        >
          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
        </svg>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white border-gray-200 py-2 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200">
            <div className="text-base font-semibold font-montserrat text-sherwood-950">
              {user?.name || 'Loading...'}
            </div>
            <div className="text-sm font-montserrat text-[#10141C]/60">
              {user?.email || ''}
            </div>
          </div>
          <ul>
            <li>
              <button
                className="w-full text-left font-medium text-base text-sherwood-700 hover:text-sherwood-800 font-montserrat flex items-center py-2 px-3"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;
