// src/controllers/linkedinController.js
const LinkedInService = require('../services/business/linkedinService');
const { success, error } = require('../utils/responseHandler');

exports.getProfile = async (req, res) => {
  try {
    const profile = await LinkedInService.getProfile(req.user.id);
    return success(res, profile, 'LinkedIn profile fetched');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.createProfile = async (req, res) => {
  try {
    const profile = await LinkedInService.createProfile(req.user.id, req.body);
    return success(res, profile, 'LinkedIn profile created', 201);
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await LinkedInService.updateProfile(req.user.id, req.body);
    return success(res, profile, 'LinkedIn profile updated');
  } catch (err) {
    return error(res, err, err.statusCode || 500);
  }
};
