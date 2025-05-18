import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import loginImage from '../images/login.svg';
import logo from '../images/Logo.svg';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      setError(false);
      navigate('/dashboard');
    } catch (err) {
      setError(true);
    }
  };

  
  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="w-1/2 bg-[#ECFDF5] relative flex items-center justify-center px-6">
        {/* Logo in top right of the green section */}
        <img src={logo} alt="Spendy Logo" className="absolute top-6 right-6 h-8" />
        <img src={loginImage} alt="login visual" className="w-[90%] max-w-[500px]" />
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold text-[#082431] mb-2 text-center">Login</h1>
          <p className="text-gray-500 mb-6 text-center">Please login to your account !</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#039866]"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#039866] pr-10"
                placeholder="Password"
                required
              />
              <div
                className="absolute inset-y-0 right-3 top-[35px] flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mb-2">⚠️ Incorrect email or password!</p>}

            <button
              type="submit"
              className="w-full bg-[#039866] text-white py-2 rounded-[12px] hover:bg-[#027658] transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
