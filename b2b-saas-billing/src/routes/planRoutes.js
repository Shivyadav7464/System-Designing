
const express = require("express");
const router = express.Router();

const {
    getPlans,
    createPlan,
    updatePlan
} = require("../controllers/planController");

// Saare plans fetch karo
router.get("/", getPlans);

// Naya plan create karo
router.post("/", createPlan);

// Existing plan update karo
router.put("/:id", updatePlan);

module.exports = router;
