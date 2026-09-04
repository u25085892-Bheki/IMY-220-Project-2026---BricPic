const express = require('express');
const cors = require('cors'); //Cross origin resource sharing to prevent browsers from stopping frontend and backend from connecting

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); 

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  res.json({ message: "Login successful", username: { username }, password: { password } });
});

app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  res.json({ message: "Registration successful", username: { username} , email: {email}, password: {password} });
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});