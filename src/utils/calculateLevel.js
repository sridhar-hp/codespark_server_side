// src/utils/calculateLevel.js

/**
 * Calculates level based on total XP.
 * Level 1 starts at 0 XP. Every 100 XP increases level by 1.
 * @param {number} totalXP
 * @returns {number} Level
 */
function calculateLevel(totalXP = 0) {
  if (!totalXP || totalXP <= 0) return 1;
  return Math.floor(totalXP / 100) + 1;
}

module.exports = {
  calculateLevel,
};
