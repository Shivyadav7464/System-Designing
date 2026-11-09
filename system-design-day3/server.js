const express = require("express");

const app = express();

const pool = require("./db");


// JSON request body ko read karne ke liye
app.use(express.json());


// Temporary movie data
// Abhi database use nahi kar rahe hain
let movies = [
    {
        id: 1,
        title: "Inception",
        year: 2010
    },
    {
        id: 2,
        title: "Interstellar",
        year: 2014
    }
];
// --------------------------------------------------
// GET /movies/:id
// Specific movie return karega
// --------------------------------------------------

                  // GET /movies
app.get("/movies", async (req, res) => {
    try {
        const [movies] = await pool.query(
            "SELECT * FROM movies"
        );

        res.status(200).json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error.message);

        res.status(500).json({
            message: "Failed to fetch movies"
        });
    }
});
                    // GET /movies/:id

app.get("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const [movies] = await pool.query(
            "SELECT * FROM movies WHERE id = ?",
            [id]
        );

        if (movies.length === 0) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.status(200).json(movies[0]);
    } catch (error) {
        next(error); // Global error handling middleware ko call karega
    }
});

// --------------------------------------------------
// POST /movies
// New movie create karega
// --------------------------------------------------

app.post("/movies", async (req, res) => {
    try {
        const { title, genre, release_year } = req.body;

        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            (genre !== undefined && typeof genre !== "string") ||
            (release_year !== undefined &&
                (!Number.isInteger(release_year) ||
                    release_year < 1888))
        ) {
            return res.status(400).json({
                message: "Invalid movie data"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO movies (title, genre, release_year)
             VALUES (?, ?, ?)`,
            [
                title.trim(),
                genre ?? null,
                release_year ?? null
            ]
        );

        res.status(201).json({
            message: "Movie created successfully",
            id: result.insertId,
            title: title.trim(),
            genre: genre ?? null,
            release_year: release_year ?? null
        });
    } catch (error) {
        console.error("Error creating movie:", error.message);

        res.status(500).json({
            message: "Failed to create movie"
        });
    }
});


// --------------------------------------------------
// PUT /movies/:id
// Existing movie update karega
// --------------------------------------------------
app.put("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, genre, release_year } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            (genre !== undefined && typeof genre !== "string") ||
            !Number.isInteger(release_year) ||
            release_year < 1888
        ) {
            return res.status(400).json({
                message: "Valid title and release_year are required"
            });
        }

        const [result] = await pool.query(
            `UPDATE movies
             SET title = ?, genre = ?, release_year = ?
             WHERE id = ?`,
            [title.trim(), genre ?? null, release_year, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.status(200).json({
            message: "Movie updated successfully",
            id,
            title: title.trim(),
            genre: genre ?? null,
            release_year
        });
    } catch (error) {
        console.error("Error updating movie:", error.message);

        res.status(500).json({
            message: "Failed to update movie"
        });
    }
});
// --------------------------------------------------
// DELETE /movies/:id
// Movie delete karega
// --------------------------------------------------


app.delete("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const [result] = await pool.query(
            "DELETE FROM movies WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.status(200).json({
            message: "Movie deleted successfully",
            id
        });
    } catch (error) {
        console.error("Error deleting movie:", error.message);

        res.status(500).json({
            message: "Failed to delete movie"
        });
    }
});


//patch /movies/:id keval specific fields ko update karega, jaise title ya year, bina poore movie object ko replace kiye.

app.patch("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, genre, release_year } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const fields = [];
        const values = [];

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim() === "") {
                return res.status(400).json({
                    message: "Title must be a non-empty string"
                });
            }

            fields.push("title = ?");
            values.push(title.trim());
        }

        if (genre !== undefined) {
            if (typeof genre !== "string") {
                return res.status(400).json({
                    message: "Genre must be a string"
                });
            }

            fields.push("genre = ?");
            values.push(genre);
        }

        if (release_year !== undefined) {
            if (
                !Number.isInteger(release_year) ||
                release_year < 1888
            ) {
                return res.status(400).json({
                    message: "Invalid release year"
                });
            }

            fields.push("release_year = ?");
            values.push(release_year);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE movies SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            const [movies] = await pool.query(
                "SELECT id FROM movies WHERE id = ?",
                [id]
            );

            if (movies.length === 0) {
                return res.status(404).json({
                    message: "Movie not found"
                });
            }
        }

        const [movies] = await pool.query(
            "SELECT * FROM movies WHERE id = ?",
            [id]
        );

        res.status(200).json(movies[0]);
    } catch (error) {
        console.error("Error updating movie:", error.message);

        res.status(500).json({
            message: "Failed to update movie"
        });
    }
});
// --------------------------------------------------
// SERVER START
// --------------------------------------------------

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Global Error:", err.message);

    res.status(500).json({
        message: "Something went wrong on the server"
    });
});

app.listen(3000, () => {

    console.log("Day 3 REST API running on http://localhost:3000");

});