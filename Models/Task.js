// Models/Task.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: String },
  text: { type: String },
  date: { type: Date, default: Date.now }
});

const HistorySchema = new mongoose.Schema({
  field: { type: String },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  updatedBy: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    default: 'TODO'
  },
  dueDate: { type: Date },

  // Student fields
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  tags: { type: [String], default: [] },
  category: { type: String, default: '' },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // 0 - 100
  attachments: { type: [String], default: [] }, // URLs
  createdBy: { type: String, default: '' },
  assignedTo: { type: String, default: '' },
  reviewer: { type: String, default: '' },
  team: { type: [String], default: [] }, // array of team names or single string as array
  completedAt: { type: Date },
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { type: String, default: '' }, // e.g., DAILY, WEEKLY
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  subTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  comments: { type: [CommentSchema], default: [] },
  historyLog: { type: [HistorySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
