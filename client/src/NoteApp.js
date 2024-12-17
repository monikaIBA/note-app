import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles.css'; 
import { jwtDecode } from 'jwt-decode';


//noteapp component

const NoteApp = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const[error,setError]=useState('');


// Fetch the notes
  const fetchNotes = useCallback(async () => {
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const res = await axios.get(`http://localhost:5000/api/notes/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      setError('Error fetching notes');
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setError('User is not authenticated');
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token, fetchNotes]);


  //Add note
  const addNote = async () => {
    try {
      // Log the request details for debugging
      console.log('Sending request to add note:', { newNote, token });
  
      const res = await axios.post(
        'http://localhost:5000/api/notes',
        { ...newNote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('Note added successfully:', res.data);
  
      // Update the notes and reset the input
      setNotes((prevNotes) => [...prevNotes, res.data]);
      setNewNote({ title: '', content: '' });
    } catch (err) {
      // Log full error for debugging
      console.error('Error details:', err);
    }
  };
  

  // Delete a note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err.response?.data?.message || err.message);
    }
  };

  // Edit a note
  const editNote = async (id) => {
    try {
      const title = prompt('Enter new title');
      const content = prompt('Enter new content');
      const res = await axios.put(
        `http://localhost:5000/api/notes/${id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map((note) => (note._id === id ? res.data : note)));
    } catch (err) {
      console.error('Failed to edit note:', err.response?.data?.message || err.message);
    }
  };

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);
    setNotes([]);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={newNote.title}
        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
      />
      <textarea
        placeholder="Content"
        value={newNote.content}
        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
      />
      <button onClick={addNote}>Add Note</button>

      {/* Display Notes */}
      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => editNote(note._id)}>Edit</button>
            <button onClick={() => deleteNote(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
};
export default NoteApp;
