const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  auth: {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    salt: String,
    roles: {
      type: [String],
      default: ['user']
    }
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatar: String
  },
  metadata: {
    created_at: {
      type: Date,
      default: Date.now
    },
    last_login: Date,
    active: {
      type: Boolean,
      default: true
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('auth.password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.auth.password = await bcrypt.hash(this.auth.password, salt);
    this.auth.salt = salt;
    next();
  } catch (err) {
    next(err);
  }
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { _id: this._id, roles: this.auth.roles },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.auth.password);
};

// Update last login
userSchema.methods.softDelete = function() {
  this.metadata.active = false;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);