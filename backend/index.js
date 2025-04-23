const express = require('express');
const cors = require('cors');
const tutorsRouter = require('./routes/tutors');
const caseRoutes = require('./routes/cases');
const tutorCaseRoutes = require('./routes/tutorCases');
const categoryRoutes = require('./routes/categories');
const searchRoutes = require('./routes/search');
const hotSubjectRoutes = require('./routes/hotSubjects');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tutors', tutorsRouter);
app.use('/api/cases', caseRoutes);
app.use('/api/tutor-cases', tutorCaseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/hot-subjects', hotSubjectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 