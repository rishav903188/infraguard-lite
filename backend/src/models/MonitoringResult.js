'use strict';

const mongoose = require('mongoose');

const monitoringResultSchema = new mongoose.Schema(
  {
    monitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitor',
      required: [true, 'monitorId is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['up', 'down'],
      required: [true, 'status is required'],
    },
    statusCode: {
      type: Number,
      default: null,
    },
    responseTime: {
      type: Number, // milliseconds
      default: null,
    },
    error: {
      type: String, // error message if failed
      default: null,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // No updatedAt needed — results are immutable
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: false,
  }
);

// TTL index: auto-delete results older than 30 days
monitoringResultSchema.index(
  { checkedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// Compound index for efficient per-monitor analytics queries
monitoringResultSchema.index({ monitorId: 1, checkedAt: -1 });
monitoringResultSchema.index({ monitorId: 1, status: 1 });

const MonitoringResult = mongoose.model('MonitoringResult', monitoringResultSchema);
module.exports = MonitoringResult;
