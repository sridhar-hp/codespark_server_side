// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '', trim: true },
    avatar: { type: String, default: '', trim: true },
    bio: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    occupation: { type: String, default: '', trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    githubUsername: { type: String, default: '', trim: true },
    leetcodeUsername: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true },
    linkedinUrl: { type: String, default: '', trim: true },
    settings: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSettings' },
    stats: { type: mongoose.Schema.Types.ObjectId, ref: 'UserStats' },
  },
  { timestamps: true }
);

// Pre-save hook to hash password if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
