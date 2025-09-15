'use strict';
const User = require('../models/user.model');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

exports.assignRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    if (!Array.isArray(roles) || roles.length === 0) return res.status(400).json({ success: false, message: 'roles must be array' });
    const updatedUser = await User.findByIdAndUpdate(id, { roles }, { new: true }).select('-passwordHash');
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: updatedUser });
  } catch (err) { next(err); }
};
exports.cleanUsers = async (req, res, next) => {
  try {
    const result = await User.deleteMany({ roles: { $ne: "admin" } });
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} non-admin users`
    });
  } catch (err) {
    next(err);
  }
};