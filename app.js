import express from "express"; // Import express
import pg from "pg"; // Import pg

const PORT = 8001; // Assign 8001 to PORT const

const app = express(); // Invoke express framework and store it in const app

app.use(express.json()); // Utilize middleware proviced by express that parses data into json format

const pool = new pg.Pool({ // Create a collection of database connections (new pool instances) and assign it to the pool const 
    host: 'localhost',
    port: 6432,
    user: 'postgres',
    password: 'postgres',
    database: 'goals_db',
});

// GET method that retrieves all records from the goal table in goals_db 
app.get("/goals", (req, res) => { 
    pool.query(`SELECT * FROM goals`) // Query that selects all records from goals
    .then((data) => { // If query is successful
        res.json(data.rows); // Respond with all the rows in json format
    })
    .catch((err) => { // If query was unsuccessful
        console.error(err); // Log out error
        res.status(500).send("Internal Server Error"); // Respond with a 500 message
    })
})

// GET method that retrieves single record with a specific id
app.get("/goals/:id", (req, res) => { 
    const id = parseInt(req.params.id); // parse id and store it in const id

    if (isNaN(id)) { // Verify whether or not id is a number
        res.status(400).send("Invalid Id"); // If not, send a response stating that the id is invalid
        return; // Terminate code execution 
    }
    pool.query(`SELECT * FROM goals WHERE goalId = $1`, [id]) // Query that selects all the info from a record with a specific id 
        .then((data) => { // If query was successful
            if (data.rows.length === 0) { // Verify if record exists 
                res.sendStatus(404); // If it does not, send 404 message
                return; // Terminate code execution 
            }
            res.json(data.rows[0]) // If it does, respond with record in json format
        })
        .catch((err) => { // If query was unsuccessful
            console.error(err); // Log out error
            res.status(500).send("Internal Server Error"); // Send 500 message
        })
});

// POST method that inserts record into database
app.post("/goals", (req, res) => {
    const goal = req.body.goal; // Store goal in const 

    if (!goal) { // Verify if goal is not specified
        res.status(400).send("Missing goal information."); // If it's not specified , send 400 message
        return; // Terminate code execution 
    }
    pool.query(`INSERT INTO goals (goal) VALUES ($1) RETURNING *`, [goal]) // Query that inserts record into db with given input
        .then((data) => { // If query was successful, 
            res.status(201).json(data.rows[0]); // Respond with 201 message and record in json format
        })
        .catch((err) => { // If query was unsuccessful,
            console.error(err); // Log out message
            res.status(500).send("Internal Server Error"); // Send a 500 message
        })
});

// PATCH method that updates a record with a specific id
app.patch("/goals/:id", (req, res) => {
    const id = parseInt(req.params.id); // parse id and store it in const  
    const goal = req.body.goal; // Store goal in const 

    if (isNaN(id)) { // Verify if Id is a number 
        res.status(400).send("Invalid Id."); // If it's not, send 400 message
        return; // And terminate code execution
    }
    pool.query(`UPDATE goals SET goal = COALESCE($1, goal) WHERE goalId = $2 RETURNING *`, [goal, id]) // Query that updates specific record
        .then((data) => { // If query was successful
            if (data.rows.length === 0) { // Verify if record exists 
                res.status(404).send(`Goal with id: ${id} could not be found.`); // If it does not, send 404 message
                return; // And terminate code execution
            }
            res.json(data.rows[0]); // If it does, respond with record in json format
        })
        .catch((err) => { // If query was unsuccessful
            console.error(err); // Log out error
            res.sendStatus(500); // Send 500 message 
        })
});

// DELETE method that deletes record with a specific id 
app.delete("/goals/:id", (req, res) => {
    const id = parseInt(req.params.id); // Parse id and store it in const 

    if (isNaN(id)) { // Verify if id is a number
        res.status(400).send("Invalid Id."); // If it's not, send 400 message
        return; // And terminate code execution 
    }
    pool.query(`DELETE FROM goals WHERE goalId = $1 RETURNING *`, [id]) // Query that deletes record with specific id 
        .then((data) => { // If query was successful
            if (data.rows.length === 0) { // Verify if record exists 
                res.status(404).send(`Goal with id: ${id} could not be found.`); // If it does not, send 404 message
                return; // And terminate code execution 
            }
            res.status(200).send(`Goal with id ${id} has been deleted`); // If it does exist, send 200 message
        })
        .catch((err) => { // If query was unsuccessful
            console.error(err); // Log out error
            res.sendStatus(500); // Send 500 message
        })
})

// LISTEN method that listens on a specific port
app.listen(PORT, () => { 
    console.log(`Listening on port ${PORT}`); // Log message
});