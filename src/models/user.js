const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { USER_STATUS, USER_ROLE } = require('../constants/users');
const { generateRandomTokens } = require('../utils/general');
const { ACTIVITY_STATUS } = require('../constants/activity');

const userSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 50,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.INVITED,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
    avatar: String,
    invitedBy: {
      type: Schema.ObjectId,
      ref: 'User',
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    techData: {
      invitationToken: String,
      // this field is used only for checking
      // if user changed password after the token was issued
      passwordChangedAt: Date,
      // fields for reseting a password
      passwordResetToken: String,
      passwordResetExpires: Date,
    },
    createdAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ name: 1, status: 1 });

userSchema.virtual('newBonusesCount', {
  ref: 'Bonus',
  foreignField: 'userId',
  localField: '_id',
  count: true,
  match: {
    viewed: false,
  },
});

userSchema.virtual('newActivitiesCount', {
  ref: 'Activity',
  foreignField: 'userId',
  localField: '_id',
  count: true,
  match: {
    viewed: false,
    status: ACTIVITY_STATUS.ACTIVE,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.techData.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.techData.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const [resetToken, resetTokenEncrypted] = generateRandomTokens();

  this.techData.passwordResetToken = resetTokenEncrypted;

  // 10 minutes
  this.techData.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // send to user NOT encrypted token
  // stored in db encrypted token
  // then compare them
  return resetToken;
};

const User = model('User', userSchema);

module.exports = User;
