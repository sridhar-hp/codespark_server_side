// src/models/Communication.js
const mongoose = require('mongoose');

const TYPE_ENUM = [
  'Interview',
  'HR',
  'Recruiter',
  'Networking',
  'Meeting',
  'Email',
  'LinkedIn',
  'Phone Call',
  'Mock Interview',
  'Other',
];

const STATUS_ENUM = ['Upcoming', 'Completed', 'Missed', 'Cancelled'];
const PRIORITY_ENUM = ['Low', 'Medium', 'High'];
const PLATFORM_ENUM = [
  'Phone',
  'Zoom',
  'Google Meet',
  'Microsoft Teams',
  'LinkedIn',
  'Email',
  'WhatsApp',
  'Other',
];

const communicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    personName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    communicationType: {
      type: String,
      required: true,
      enum: TYPE_ENUM,
      default: 'Interview',
    },
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: 'Upcoming',
    },
    priority: {
      type: String,
      enum: PRIORITY_ENUM,
      default: 'Medium',
    },
    platform: {
      type: String,
      enum: PLATFORM_ENUM,
      default: 'Zoom',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      min: 0,
      max: 600,
      default: 30,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    attachments: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

communicationSchema.pre('save', function () {
  if (this.user && !this.userId) {
    this.userId = this.user;
  } else if (this.userId && !this.user) {
    this.user = this.userId;
  }
});

// Indexes for activity tracking
communicationSchema.index({ user: 1, scheduledAt: -1 });
communicationSchema.index({ userId: 1, scheduledAt: -1 });
communicationSchema.index({ user: 1, status: 1 });
communicationSchema.index({ user: 1, communicationType: 1 });
communicationSchema.index({ user: 1, priority: 1 });
communicationSchema.index({ user: 1, followUpRequired: 1, followUpDate: 1 });

const Communication = mongoose.model('Communication', communicationSchema);

/**
 * Migration helper to drop obsolete unique index `user_1_channel_1_messageId_1`
 * from MongoDB `communications` collection if it exists.
 */
const dropLegacyIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collection = db.collection('communications');
    if (!collection) return;

    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (
        idx.name === 'user_1_channel_1_messageId_1' ||
        (idx.key && (idx.key.channel || idx.key.messageId))
      ) {
        console.log(`[Migration] Dropping obsolete unique index: ${idx.name}`);
        await collection.dropIndex(idx.name);
      }
    }
  } catch (err) {
    if (err.code !== 26 && err.codeName !== 'NamespaceNotFound') {
      console.warn('[Migration] Legacy index check notice:', err.message);
    }
  }
};

mongoose.connection.on('connected', () => {
  dropLegacyIndexes();
});

if (mongoose.connection.readyState === 1) {
  dropLegacyIndexes();
}

module.exports = Communication;
module.exports.TYPE_ENUM = TYPE_ENUM;
module.exports.STATUS_ENUM = STATUS_ENUM;
module.exports.PRIORITY_ENUM = PRIORITY_ENUM;
module.exports.PLATFORM_ENUM = PLATFORM_ENUM;
module.exports.dropLegacyIndexes = dropLegacyIndexes;
