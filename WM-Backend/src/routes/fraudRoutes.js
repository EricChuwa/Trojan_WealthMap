const express = require("express");
const alerts = require("../data/alerts");

const router = express.Router();

router.get("/alerts", (req, res) => {
    res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts
    });
});

module.exports = router;
