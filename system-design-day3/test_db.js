
const pool = require("./db");

async function testDatabase() {
    try {
        const [movies] = await pool.query(
            "SELECT * FROM movies"
        );

        console.log("Movies fetched successfully!");
        console.table(movies);
    } catch (error) {
        console.error("Database error:", error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();
