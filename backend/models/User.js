const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false }, // null for Google users
  googleId: { type: String, sparse: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['tourist', 'guide', 'admin'], default: 'tourist' },
  phone: { type: String, default: '' },
  memberSince: { type: Date, default: Date.now },

  // Tourist-specific
  savedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedItineraries: [{ type: mongoose.Schema.Types.Mixed }],

  // Guide-specific fields (populated when role === 'guide')
  city: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  languages: [String],
  specialties: [String],
  tagline: { type: String, default: '' },
  about: { type: String, default: '' },
  price: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  tours: { type: Number, default: 0 },
  availability: [String],
  photo: { type: String, default: '' },
  completionRate: { type: Number, default: 0 },
  responseTime: { type: String, default: '' },
  documents: {
    aadhaar: { type: String, default: '' },
    certificate: { type: String, default: '' },
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
