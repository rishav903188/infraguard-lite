'use strict';

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    monitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitor',
      required: [true, 'monitorId is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['down', 'recovered'],
      required: [true, 'Alert type is required'],
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: false,
  }
);

alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ monitorId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, isRead: 1 });

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
