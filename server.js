const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// we don't need this since we can fetch a JSON directly on client side
app.get("/blocks/:filename", (req, res) => {
  const filePath = path.join(__dirname, "blocks", req.params.filename);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.send(data).json();
  });
});

// Handle root path explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// use this to fetch the footer.py and header.py
app.get("/python/:filename", (req, res) => {
  const filePath = path.join(__dirname, "blocks", req.params.filename);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.send(data).json();
  });
});

// Endpoint to write to a file (output)
app.post("/write/:filename", (req, res) => {
  const filePath = path.join(__dirname, "python", req.params.filename);
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf8", (err) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    res.send(`File written successfully to ${filePath}`);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
