import React,{useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import NoteApp from './NoteApp';
import './home.css';

const Home = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve the username from localStorage
        const storedUsername = localStorage.getItem('username'); 
        const token=localStorage.getItem('token')
        console.log(token)

        if (storedUsername) {
        // Set the username in the state
          setUsername(storedUsername); 
        } else {
          // If no user is logged in, redirect to login page
          navigate('/login');
        }
      }, [navigate]);
    

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div>
            <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
            <button onClick={handleLogout}>Logout</button>
            <h1>Welcome to NoteApp, {username}</h1>
            <NoteApp />
        </div>
    );
};

export default Home;
