// src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dpRoutes = require('./routes/dailyProgressRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const journalRoutes = require('./routes/journalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const githubRoutes = require('./routes/githubRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');
const learningRoutes = require('./routes/learningRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const linkedinRoutes = require('./routes/linkedinRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

const app = express();

// Global middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API version prefix
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/daily-progress', dpRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/journal', journalRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/github', githubRoutes);
app.use('/api/v1/leetcode', leetcodeRoutes);
app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/communication', communicationRoutes);
app.use('/api/v1/linkedin', linkedinRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/password-reset', passwordResetRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
