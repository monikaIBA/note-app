import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      const { token } = response.data; 

      if (token) {
        // Save token in localStorage
        localStorage.setItem('token', token); 
        // Save username in localStorage
        localStorage.setItem('username', username); 
        setIsAuthenticated(true);
        console.log('Token stored in localStorage:', localStorage.getItem('token'));
        navigate('/'); // Redirect to home page
      } else {
        alert('Login failed: Missing token');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input 
        id="username"
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        id="password"
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button onClick={handleLogin}>Login</button>
      <p>Not registered yet? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;
