import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const EditProfile = () => {
  const [user, setUser] = useState({ username: '', password: '' });
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Decode token to retrieve the user ID
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (err) {
        console.error('Error decoding token:', err);
        alert('Invalid session. Please log in again.');
        navigate('/login');
      }
    } else {
      alert('You are not logged in. Redirecting to login.');
      navigate('/login');
    }
  }, [navigate]);

  const handleEdit = async () => {
    try {
      if (!userId) throw new Error('User ID not available');
      const response=await axios.put(`http://localhost:5000/api/users/${userId}`, user, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data && response.data.username) {
        setUser((prev) => ({ ...prev, username: response.data.username }));
      }
      localStorage.setItem('username',user.username)
      alert('Profile updated successfully.');
      navigate('/');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      if (!userId) throw new Error('User ID not available');
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Account deleted successfully.');
      localStorage.removeItem('token');
      navigate('/register');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <input
        type="text"
        placeholder="New Username"
        value={user.username || ''}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="New Password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <button onClick={handleEdit}>Update Profile</button>
      <button onClick={handleDelete}>Delete Account</button>
    </div>
  );
};

export default EditProfile;
