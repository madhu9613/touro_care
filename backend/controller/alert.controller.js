'use strict';
const Alert = require('../models/alert.model');
const { broadcast } = require('../services/wsService');

// Accept an alert
exports.acceptAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id; // get user from auth middleware

    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Check if already accepted by someone else
    if (alert.status === 'accepted' && alert.acceptedBy.toString() !== userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alert already accepted by another user' 
      });
    }

    alert.status = 'accepted';
    alert.acceptedBy = userId;
    alert.acceptedAt = new Date();
    alert.updatedAt = new Date();

    await alert.save();

    broadcast('alert_updated', {
      alertId: alert._id,
      status: alert.status,
      acceptedBy: userId,
      acceptedAt: alert.acceptedAt
    });

    res.json({ success: true, message: 'Alert accepted successfully', alert });

  } catch (err) {
    console.error('acceptAlert error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all alerts
exports.getAlerts = async (req, res) => {
  try {
    const { status, type } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const alerts = await Alert.find(filter)
      .populate('acceptedBy', 'name email')
      .populate('handledBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, alerts });
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
