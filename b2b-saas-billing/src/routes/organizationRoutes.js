const express = require("express");
const router = express.Router();

const {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
} = require("../controllers/organizationController");

// POST request se naya organization create hoga
router.post("/", createOrganization);

// GET request se organizations fetch honge
router.get("/", getOrganizations);

// GET request se specific organization fetch hoga
router.get("/:id", getOrganizationById);

// PUT request se specific organization update hoga
router.put("/:id", updateOrganization);

// DELETE request se specific organization delete hoga
router.delete("/:id", deleteOrganization);

module.exports = router;


