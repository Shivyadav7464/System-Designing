
const pool = require("../config/db");

// Create Organization
async function createOrganization(req, res) {
    try {
        const { name, email } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            !name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Valid name and email are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        const sql = `
            INSERT INTO organizations (name, email)
            VALUES (?, ?)
        `;

        const [result] = await pool.execute(sql, [
            cleanName,
            cleanEmail
        ]);

        return res.status(201).json({
            message: "Organization created successfully",
            organization: {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        console.error("Create organization error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Get All Organizations
async function getOrganizations(req, res) {
    try {
        const [organizations] = await pool.query(
            "SELECT * FROM organizations ORDER BY id DESC"
        );

        return res.status(200).json({
            count: organizations.length,
            organizations
        });

    } catch (error) {
        console.error("Get organizations error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Get Organization By ID
async function getOrganizationById(req, res) {
    try {
        const id = req.params.id;

        // Check whether ID is a positive integer
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Organization ID must be a positive integer"
            });
        }

        const [organizations] = await pool.execute(
            "SELECT * FROM organizations WHERE id = ?",
            [id]
        );

        if (organizations.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        return res.status(200).json({
            organization: organizations[0]
        });

    } catch (error) {
        console.error(
            "Get organization by ID error:",
            error.message
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


async function updateOrganization(req, res) {
    try {
        const id = req.params.id;
        const { name, email } = req.body;

        // Validate ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Organization ID must be a positive integer"
            });
        }

        // Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            !name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Valid name and email are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        // Update organization in MySQL
        const [result] = await pool.execute(
            `UPDATE organizations
             SET name = ?, email = ?
             WHERE id = ?`,
            [cleanName, cleanEmail, id]
        );

        // Check whether the organization exists
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        return res.status(200).json({
            message: "Organization updated successfully",
            organization: {
                id: Number(id),
                name: cleanName,
                email: cleanEmail
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        console.error("Update organization error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


async function deleteOrganization(req, res) {
    try {
        const id = req.params.id;

        // Validate organization ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Organization ID must be a positive integer"
            });
        }

        // Delete organization from MySQL
        const [result] = await pool.execute(
            "DELETE FROM organizations WHERE id = ?",
            [id]
        );

        // Check whether a record was deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        return res.status(200).json({
            message: "Organization deleted successfully",
            id: Number(id)
        });

    
} catch (error) {
    // Organization is referenced by existing subscriptions
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
            message: "Cannot delete organization because it has existing subscriptions"
        });
    }

    console.error("Delete organization error:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });

    }
}




module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
};
