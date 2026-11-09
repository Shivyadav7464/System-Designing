const express = require("express");
const router = express.Router();

const {
    getSubscriptions,
    createSubscription,
    cancelSubscription,
    getSubscriptionById
} = require("../controllers/subscriptionController");

router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.patch("/:id/cancel", cancelSubscription);
router.get("/:id", getSubscriptionById);

module.exports = router;