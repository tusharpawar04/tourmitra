const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['aadhaar', 'pan', 'driving_license', 'passport', 'certificate', 'other'], 
    required: true 
  },
  url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
}, { _id: true });

const verificationSchema = new mongoose.Schema({
  guide_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  status: {
    type: String,
    enum: ['not_started', 'submitted', 'in_review', 'verified', 'rejected', 'additional_info_required'],
    default: 'not_started',
  },
  
  documents: [documentSchema],
  
  // Admin review
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewed_at: { type: Date },
  admin_notes: { type: String },
  rejection_reason: { type: String },
  
  // History
  history: [{
    status: { type: String },
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changed_at: { type: Date, default: Date.now },
    notes: { type: String },
  }],
  
}, { timestamps: true });

// Indexes
verificationSchema.index({ guide_id: 1 });
verificationSchema.index({ status: 1 });

// Method: Submit verification
verificationSchema.methods.submit = function(documents, userId) {
  this.documents = documents;
  this.status = 'submitted';
  
  this.history.push({
    status: 'submitted',
    changed_by: userId,
    changed_at: new Date(),
    notes: 'Verification documents submitted',
  });
};

// Method: Approve verification
verificationSchema.methods.approve = function(adminId, notes = '') {
  this.status = 'verified';
  this.reviewed_by = adminId;
  this.reviewed_at = new Date();
  this.admin_notes = notes;
  
  this.history.push({
    status: 'verified',
    changed_by: adminId,
    changed_at: new Date(),
    notes: notes || 'Verification approved',
  });
};

// Method: Reject verification
verificationSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.reviewed_by = adminId;
  this.reviewed_at = new Date();
  this.rejection_reason = reason;
  this.admin_notes = reason;
  
  this.history.push({
    status: 'rejected',
    changed_by: adminId,
    changed_at: new Date(),
    notes: reason,
  });
};

// Method: Request additional info
verificationSchema.methods.requestAdditionalInfo = function(adminId, reason) {
  this.status = 'additional_info_required';
  this.reviewed_by = adminId;
  this.reviewed_at = new Date();
  this.admin_notes = reason;
  
  this.history.push({
    status: 'additional_info_required',
    changed_by: adminId,
    changed_at: new Date(),
    notes: reason,
  });
};

module.exports = mongoose.model('Verification', verificationSchema);
