import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

/**
 * Register a new customer
 */
export const registerUser = async ({ username, email, password, phone = '' }) => {
  // Check if email or username is already taken by User
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new AppError('This username is already taken. Please choose another.', 409);
  }

  // Also verify against Admin collection so emails/usernames don't collide
  const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
  if (existingAdmin) {
    throw new AppError('This identifier cannot be used for customer registration.', 409);
  }

  // Hash password
  const passwordHash = await User.hashPassword(password);

  // Save new user (role is enforced as customer)
  const user = await User.create({
    username,
    email,
    passwordHash,
    role: 'customer',
    phone,
  });

  const token = generateToken({
    id: user._id,
    role: user.role,
    username: user.username,
    email: user.email,
  });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      favorites: user.favorites,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Log in an existing customer
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken({
    id: user._id,
    role: user.role,
    username: user.username,
    email: user.email,
  });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      favorites: user.favorites,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Log in an administrator
 */
export const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  if (!admin) {
    throw new AppError('Invalid administrator credentials.', 401);
  }

  if (!admin.isActive) {
    throw new AppError('This administrator account has been deactivated.', 403);
  }

  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid administrator credentials.', 401);
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken({
    id: admin._id,
    role: 'admin',
    username: admin.username,
    email: admin.email,
  });

  return {
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: 'admin',
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
    },
    token,
  };
};

/**
 * Retrieve current user or admin by decoded token payload
 */
export const getCurrentAccount = async ({ id, role }) => {
  if (role === 'admin') {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new AppError('Administrator account not found.', 404);
    }
    return {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: 'admin',
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
    };
  }

  const user = await User.findById(id).populate('favorites', 'title posterUrl genres rating durationMinutes');
  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    favorites: user.favorites,
    createdAt: user.createdAt,
  };
};

export default {
  registerUser,
  loginUser,
  loginAdmin,
  getCurrentAccount,
};
