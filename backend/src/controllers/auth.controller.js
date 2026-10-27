import authService from '../services/auth.service.js';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, phone } = req.body;
    const result = await authService.registerUser({ username, email, password, phone });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an administrator
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin({ email, password });

    res.status(200).json({
      success: true,
      message: 'Administrator authenticated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    const account = await authService.getCurrentAccount({
      id: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        account,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout endpoint (invalidates client session)
 */
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export default {
  register,
  login,
  adminLogin,
  getMe,
  logout,
};
