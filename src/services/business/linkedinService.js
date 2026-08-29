// src/services/business/linkedinService.js
const LinkedInProfile = require('../../models/LinkedInProfile');
const ActivityService = require('./activityService');
const NotificationService = require('./notificationService');

class LinkedInService {
  /**
   * Get user's LinkedIn profile.
   */
  static async getProfile(userId) {
    const profile = await LinkedInProfile.findOne({ user: userId });
    return profile;
  }

  /**
   * Create user's LinkedIn profile.
   */
  static async createProfile(userId, profileData) {
    let profile = await LinkedInProfile.findOne({ user: userId });
    if (profile) {
      // If profile already exists, delegate to updateProfile
      return this.updateProfile(userId, profileData);
    }

    profile = new LinkedInProfile({
      user: userId,
      ...profileData,
    });

    await profile.save();

    // Log Activity & Create Notification as per Step 9 & 10
    await ActivityService.createActivity(userId, {
      activityType: 'LINKEDIN_PROFILE_CREATED',
      title: 'LinkedIn Profile Created',
      description: 'LinkedIn career profile initialized on CodeSpark.',
      module: 'linkedin',
      icon: 'Briefcase',
      color: 'amber',
    });

    await NotificationService.createNotification(userId, {
      title: 'LinkedIn Profile',
      message: 'LinkedIn profile created successfully.',
      type: 'SYSTEM',
      relatedEntity: profile._id,
      relatedEntityType: 'LinkedInProfile',
    });

    return profile;
  }

  /**
   * Update user's LinkedIn profile.
   */
  static async updateProfile(userId, updateData) {
    let profile = await LinkedInProfile.findOne({ user: userId });

    if (!profile) {
      // If profile doesn't exist, create it
      return this.createProfile(userId, updateData);
    }

    Object.assign(profile, updateData);
    await profile.save();

    // Log Activity & Create Notification as per Step 9 & 10
    await ActivityService.createActivity(userId, {
      activityType: 'LINKEDIN_PROFILE_UPDATED',
      title: 'LinkedIn Profile Updated',
      description: 'LinkedIn career details updated.',
      module: 'linkedin',
      icon: 'Pencil',
      color: 'cyan',
    });

    await NotificationService.createNotification(userId, {
      title: 'LinkedIn Profile',
      message: 'LinkedIn profile updated successfully.',
      type: 'SYSTEM',
      relatedEntity: profile._id,
      relatedEntityType: 'LinkedInProfile',
    });

    return profile;
  }
}

module.exports = LinkedInService;
