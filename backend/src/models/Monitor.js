'use strict';

const mongoose = require('mongoose');

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const monitorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Monitor name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'URL must start with http:// or https://'],
    },
    method: {
      type: String,
      enum: VALID_METHODS,
      default: 'GET',
      uppercase: true,
    },
    interval: {
      type: Number,
      default: 5,
      min: [1, 'Interval must be at least 1 minute'],
      max: [60, 'Interval must be at most 60 minutes'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    lastStatus: {
      type: String,
      enum: ['up', 'down', 'unknown'],
      default: 'unknown',
    },
    consecutiveFailures: {
      type: Number,
      default: 0,
      min: 0,
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

monitorSchema.index({ userId: 1, isActive: 1 });
monitorSchema.index({ userId: 1, createdAt: -1 });

const Monitor = mongoose.model('Monitor', monitorSchema);
module.exports = Monitor;
