// src/services/business/userService.js
const User = require('../../models/User');
const UserSettings = require('../../models/UserSettings');
const UserStats = require('../../models/UserStats');

class UserService {
  static async getProfile(userId) {
    const user = await User.findById(userId)
      .select('-password')
      .populate('settings')
      .populate('stats');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  static async updateProfile(userId, updates) {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }
}

module.exports = UserService;
