const pool = require("../config/db");

const getSubscriptions = async (req, res) => {
    try {
        const [subscriptions] = await pool.execute(`
            SELECT
                s.id AS subscription_id,
                o.name AS organization_name,
                p.name AS plan_name,
                p.price,
                p.billing_cycle,
                s.status,
                s.start_date
            FROM subscriptions s
            JOIN organizations o
                ON s.organization_id = o.id
            JOIN plans p
                ON s.plan_id = p.id
            ORDER BY s.id DESC
        `);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        console.error("Get subscriptions error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions"
        });
    }
};


async function createSubscription(req, res) {
    try {
        const { organization_id, plan_id } = req.body;

        // Validate IDs
        if (
            !Number.isInteger(organization_id) ||
            organization_id <= 0 ||
            !Number.isInteger(plan_id) ||
            plan_id <= 0
        ) {
            return res.status(400).json({
                message: "Valid organization_id and plan_id are required as integers"
            });
        }

        // Verify that the organization exists
        const [organizations] = await pool.execute(
            "SELECT id FROM organizations WHERE id = ?",
            [organization_id]
        );

        if (organizations.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        // Verify that the plan exists
        const [plans] = await pool.execute(
            "SELECT id, billing_cycle FROM plans WHERE id = ?",
            [plan_id]
        );

        if (plans.length === 0) {
            return res.status(404).json({
                message: "Plan not found"
            });
        }

        const [activeSubscriptions] = await pool.execute(
    `SELECT id
     FROM subscriptions
     WHERE organization_id = ?
       AND status = 'active'`,
    [organization_id]
);

if (activeSubscriptions.length > 0) {
    return res.status(409).json({
        success: false,
        message: "Organization already has an active subscription"
    });
}

        // Create subscription
        const [result] = await pool.execute(
    `INSERT INTO subscriptions
        (organization_id, plan_id, status, start_date, end_date)
     VALUES (
        ?, ?,
        'active',
        CURDATE(),
        CASE
            WHEN ? = 'monthly'
                THEN DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
            WHEN ? = 'yearly'
                THEN DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
        END
     )`,
    [
        organization_id,
        plan_id,
        plans[0].billing_cycle,
        plans[0].billing_cycle
    ]
);

        const [newSubscription] = await pool.execute(
    `SELECT id, organization_id, plan_id, status, start_date, end_date
     FROM subscriptions
     WHERE id = ?`,
    [result.insertId]
);

return res.status(201).json({
    message: "Subscription created successfully",
    subscription: newSubscription[0]
});
    } catch (error) {
        console.error("Create subscription error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}



async function cancelSubscription(req, res) {
    try {
        const { id } = req.params;

        // Check whether subscription exists
        const [subscriptions] = await pool.execute(
            "SELECT id, status FROM subscriptions WHERE id = ?",
            [id]
        );

        if (subscriptions.length === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        if (subscriptions[0].status === "cancelled") {
            return res.status(400).json({
                message: "Subscription is already cancelled"
            });
        }

        // Update subscription status
        await pool.execute(
            "UPDATE subscriptions SET status = 'cancelled' WHERE id = ?",
            [id]
        );

        return res.status(200).json({
            message: "Subscription cancelled successfully",
            subscription_id: Number(id),
            status: "cancelled"
        });
    } catch (error) {
        console.error("Cancel subscription error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}



async function getSubscriptionById(req, res) {
    try {
        const { id } = req.params;

        const [subscriptions] = await pool.execute(
            `SELECT
                s.id AS subscription_id,
                o.name AS organization_name,
                p.name AS plan_name,
                p.price,
                p.billing_cycle,
                s.status,
                s.start_date
            FROM subscriptions s
            JOIN organizations o
                ON s.organization_id = o.id
            JOIN plans p
                ON s.plan_id = p.id
            WHERE s.id = ?`,
            [id]
        );

        if (subscriptions.length === 0) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: subscriptions[0]
        });
    } catch (error) {
        console.error("Get subscription by ID error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = { getSubscriptions, createSubscription, cancelSubscription, getSubscriptionById };  