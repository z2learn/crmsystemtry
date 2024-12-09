const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite database setup
const dbPath =
  process.env.NODE_ENV === "production"
    ? "/var/data/crm.db"
    : path.join(__dirname, "crm.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      status TEXT,
      notes TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    db.get(
      "SELECT email FROM users WHERE email = ?",
      [email],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ error: "Server error" });
        }

        if (row) {
          return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err) => {
            if (err) {
              return res.status(500).json({ error: "Server error" });
            }
            res.json({ message: "Registration successful" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: "Server error" });
        }

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          registrationDate: user.registration_date,
        };

        res.json({ success: true, user: userData });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// CRM Endpoints
// Get all customers for a user
app.get("/customers/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    "SELECT * FROM customers WHERE user_id = ? ORDER BY created_date DESC",
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Server error" });
      }
      res.json(rows);
    }
  );
});

// Add new customer
app.post("/customers", (req, res) => {
  const { name, email, phone, company, status, notes, userId } = req.body;

  db.run(
    "INSERT INTO customers (name, email, phone, company, status, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, email, phone, company, status, notes, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Server error" });
      }
      res.json({ id: this.lastID, message: "Customer added successfully" });
    }
  );
});

// Update customer
app.put("/customers/:id", (req, res) => {
  const customerId = req.params.id;
  const { name, email, phone, company, status, notes } = req.body;

  db.run(
    "UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ?, notes = ? WHERE id = ?",
    [name, email, phone, company, status, notes, customerId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Server error" });
      }
      res.json({ message: "Customer updated successfully" });
    }
  );
});

// Delete customer
app.delete("/customers/:id", (req, res) => {
  const customerId = req.params.id;

  db.run("DELETE FROM customers WHERE id = ?", [customerId], (err) => {
    if (err) {
      return res.status(500).json({ error: "Server error" });
    }
    res.json({ message: "Customer deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
