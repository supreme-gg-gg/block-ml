const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
// Middleware to parse JSON bodies
app.use(express.json());

// we can move blocks/ to public/ to avoid get request tho...
app.get("/blocks/:filename", (req, res) => {
  const filePath = path.join(__dirname, "blocks", req.params.filename);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.send(data);
  });
});

// Handle root path explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// DEPRICATED: no longer needed, header.py moved to public/ (static)
/*
app.get("/python/:filename", (req, res) => {
  const filePath = path.join(__dirname, "python", req.params.filename);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send(`Error reading file ${filePath}: ${err.message}`);
      return;
    }
    res.setHeader("Content-Type", "test/x-python");
    res.send(data);
  });
});
*/

// Endpoint to write to a file (output)
app.post("/write/:filename", (req, res) => {
  try {
    const filePath = path.join(__dirname, "build", req.params.filename);
    const { code } = req.body; // req.body.code

    if (!code) {
      return res.status(400).send("No code provided in the request.");
    }

    fs.writeFile(filePath, code, "utf8", (err) => {
      if (err) {
        res.status(500).send("Error writing file");
        return;
      }
      res.send(`File written successfully to ${filePath}`);
    });
  } catch (error) {
    console.error("unhandled error:", error);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
