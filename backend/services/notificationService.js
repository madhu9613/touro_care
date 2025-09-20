'use strict';
const { broadcast } = require('./wsService');

// Send to emergency contacts (shown in dashboard)
async function notifyEmergencyContact(contact, touristId, location, message) {
  const payload = {
    type: 'SOS_ALERT',
    touristId,
    contact,
    location,
    message,
    timestamp: new Date()
  };

  broadcast('emergency_contact', payload);
  return true;
}

// Send to authorities (shown in dashboard)
async function notifyAuthorities(alert) {
  const payload = {
    type: 'AUTHORITIES_ALERT',
    ...alert,
    timestamp: new Date()
  };

  broadcast('authorities', payload);
  return true;
}

// Send to tourist (optional)
async function notifyTourist(alert) {
  const payload = {
    type: 'TOURIST_NOTIFICATION',
    ...alert,
    timestamp: new Date()
  };

  broadcast('tourist', payload);
  return true;
}

module.exports = {
  notifyEmergencyContact,
  notifyAuthorities,
  notifyTourist
};
