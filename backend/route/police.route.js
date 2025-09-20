"use strict";

const router = require("express").Router();
const policeController = require("../controller/police.controller.js");
const { auth } = require("../middleware/auth.middleware.js");

// Police can fetch all active tourists
router.get("/active",  auth, policeController.getActiveTourists);

// Police can fetch historical movement / anomaly records for a tourist
router.get("/history/:touristId", auth, policeController.getTouristHistory);
router.get("/efirs", policeController.getEfirs)
router.get("/efirs/:id", auth,policeController.getEfirById)

module.exports = router;
