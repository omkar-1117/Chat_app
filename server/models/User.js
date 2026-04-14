const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
      default: function () {
        const colors = ['e74c3c', '3498db', '2ecc71', 'f39c12', '9b59b6', 'e67e22', '1abc9c'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `https://ui-avatars.com/api/?name=${this.username}&background=${color}&color=fff&bold=true`;
      },
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Set default avatar after username is set
userSchema.pre('save', function (next) {
  if (this.isNew && !this.avatar) {
    const colors = ['e74c3c', '3498db', '2ecc71', 'f39c12', '9b59b6', 'e67e22', '1abc9c'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=${color}&color=fff&bold=true&size=128`;
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
