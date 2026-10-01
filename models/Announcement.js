const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      maxlength: 80
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    audience: {
      type: String,
      enum: ['students'],
      default: 'students',
      index: true
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true
    },
    // Archival (soft archive - record retained, hidden from active list)
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: {
      type: Date,
      default: null
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
      required: true
    },
    createdByModel: {
      type: String,
      enum: ['Admin', 'User'],
      required: true,
      default: 'Admin'
    },
    createdByName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'updatedByModel',
      default: null
    },
    updatedByModel: {
      type: String,
      enum: ['Admin', 'User', null],
      default: null
    },
    updatedByName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120
    }
  },
  { timestamps: true }
);

announcementSchema.index({ audience: 1, publishedAt: -1 });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
