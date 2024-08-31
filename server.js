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

// Helper function to generate notebook JSON
function createNotebook(code) {
  return {
    cells: [
      {
        cell_type: "code",
        metadata: {},
        source: code.split("\n"),
        execution_count: null,
        outputs: [],
      },
    ],
    metadata: {},
    nbformat: 4,
    nbformat_minor: 5,
  };
}

// Endpoint to write to a file (output)
// For simplicity we just write to ipynb directly so no conversion needed
app.post("/write/:filename", (req, res) => {
  try {
    const filePath = path.join(__dirname, "build", req.params.filename);
    const { code } = req.body; // req.body.code

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (!code) {
      return res.status(400).send("No code provided in the request.");
    }

    const notebook = createNotebook(code);

    fs.writeFile(filePath, JSON.stringify(notebook, null, 2), "utf8", (err) => {
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

app.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "build", req.params.filename);

  if (fs.existsSync(filePath)) {
    // Set the appropriate headers to trigger a download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="blockml.ipynb"'
    );

    res.download(filePath, "blockml.ipynb", (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`File at ${filePath} sent successfully`);
      }
    });
  } else {
    res.status(404).send("File not found");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
