
const pool = require("../config/db");
const { redisClient } = require("../config/redis");

async function getPlans(req, res) {
    try {
        const bypassCache = req.query.cache === "false"
        // 1. Redis cache check karo
        if (redisClient.isReady && !bypassCache) {
            const cachedPlans = await redisClient.get("billflow:plans");

            // 2. Cache hit: MySQL query ki zaroorat nahi
            if (cachedPlans) {
                console.log("Plans Cache HIT");

                const plans = JSON.parse(cachedPlans);

                return res.status(200).json({
                    success: true,
                    count: plans.length,
                    data: plans,
                    source: "redis-cache"
                });
            }
        }

        console.log("Plans Cache MISS");

        // 3. Cache miss: MySQL se data fetch karo
        const [plans] = await pool.execute(
            "SELECT id, name, price, billing_cycle FROM plans ORDER BY id ASC"
        );

        // 4. Redis mein 60 seconds ke liye cache karo
        if (redisClient.isReady && !bypassCache) {
            await redisClient.set(
                "billflow:plans",
                JSON.stringify(plans),
                { EX: 60 }
            );
        }

        return res.status(200).json({
            success: true,
            count: plans.length,
            data: plans,
            source: "mysql"
        });
    } catch (error) {
        console.error("Get plans error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch plans"
        });
    }
}



async function createPlan(req, res) {
    try {
        const { name, price, billing_cycle } = req.body;

        // 1. Basic validation
        if (!name || price == null || !billing_cycle) {
            return res.status(400).json({
                success: false,
                message: "Name, price and billing_cycle are required"
            });
        }

        if (Number(price) < 0 || !Number.isFinite(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number"
            });
        }

        // 2. MySQL mein naya plan insert karo
        const [result] = await pool.execute(
            "INSERT INTO plans (name, price, billing_cycle) VALUES (?, ?, ?)",
            [name, Number(price), billing_cycle]
        );

        // 3. Plan insert hone ke baad old Redis cache delete karo
        if (redisClient.isReady) {
            await redisClient.del("billflow:plans");
            console.log("Plans cache invalidated");
        }

        return res.status(201).json({
            success: true,
            message: "Plan created successfully",
            data: {
                id: result.insertId,
                name,
                price: Number(price),
                billing_cycle
            }
        });

    } catch (error) {
        console.error("Create plan error:", error.message);
          
        return res.status(500).json({
            success: false,
            message: "Failed to create plan"
        });
    }
}

  // Update plan

  
async function updatePlan(req, res) {
    try {
        const { id } = req.params;
        const { name, price, billing_cycle } = req.body;

        // 1. Basic validation
        if (!name || price == null || !billing_cycle) {
            return res.status(400).json({
                success: false,
                message: "Name, price and billing_cycle are required"
            });
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number"
            });
        }

        // 2. MySQL mein plan update karo
        const [result] = await pool.execute(
            `UPDATE plans
             SET name = ?, price = ?, billing_cycle = ?
             WHERE id = ?`,
            [name, Number(price), billing_cycle, id]
        );

        // 3. Check karo plan exist karta tha ya nahi
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            });
        }

        // 4. Old Redis cache delete karo
        if (redisClient.isReady) {
            await redisClient.del("billflow:plans");
            console.log("Plans cache invalidated after update");
        }

        return res.status(200).json({
            success: true,
            message: "Plan updated successfully",
            data: {
                id: Number(id),
                name,
                price: Number(price),
                billing_cycle
            }
        });

    } catch (error) {
        console.error("Update plan error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update plan"
        });
    }
}


module.exports = { getPlans, createPlan, updatePlan };
