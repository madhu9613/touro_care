// 'use strict';
// const router = require('express').Router();
// const touristController = require('../controller/tourist.controller');
// const { auth } = require('../middleware/auth.middleware');

// // tourist lifecycle
// router.post('/register', auth, touristController.registerTourist);
// router.post('/location', touristController.locationUpdate);
// router.get('/verify/:touristId', auth, touristController.verifyTourist);

// module.exports = router;
'use strict';
const router = require('express').Router();
const touristController = require('../controller/trip.controller.js');

const { auth, requireRole } = require('../middleware/auth.middleware.js');

// register primary (walletId) + family digitalIds after KYC approved
router.post('/register', auth, requireRole(['tourist']), touristController.registerTourist);

// location update (existing)
router.post('/location-update', auth, touristController.locationUpdate);

// verify on-chain
router.get('/verify/:touristId', auth, touristController.verifyTourist);

module.exports = router;
