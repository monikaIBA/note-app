const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const PORT=5000;

const app = express();
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/notesapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error', err);
});

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

const Note = mongoose.model('Note', new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  console.log('Authorization Header:', req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Unauthorized' });


  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  })};  
 
// Routes

// Get notes for logged-in user
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Create a note for the logged-in user
app.post('/api/notes/', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({
      title,
      content,
      userId: req.user.id, // Associate note with logged-in user
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

// Update a note (ensure user owns it)
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Ensure note belongs to user
      { title, content },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Delete a note (ensure user owns it)
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Respond with a success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Edit User
app.put('/api/users/:id', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const updatedUser = await User.findByIdAndUpdate(
    req.params._id,
    { username, ...(password && { password: hashedPassword }) },
    { new: true }
  );

  res.json(updatedUser);
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
