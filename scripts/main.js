// Import Blockly core.
import * as Blockly from "blockly/core";
// Import the default blocks.
import * as libraryBlocks from "blockly/blocks";
// Import a generator.
import { pythonGenerator } from "blockly/python";
// Import a message file.
import * as En from "blockly/msg/en";

import * as fs from "fs";

// if we are working on node.js we would change it to const = require()

// immediately invoked function expression (IIFE)
(async function () {
  let currentButton;

  function outputGeneratedCode(
    headerPath,
    footerPath,
    generatedCode,
    outputPath
  ) {
    fs.readFile(headerPath, "utf8", (err, headerContent) => {
      if (err) {
        console.error("Error reading header file:", err);
        return;
      }

      fs.readFile(footerPath, "utf8", (err, footerContent) => {
        if (err) {
          console.error("Error reading footer file:", err);
          return;
        }

        const combinedContent =
          headerContent + "\n" + generatedCode + "\n" + footerContent;

        fs.writeFile(outputPath, combinedContent, "utf8", (err) => {
          if (err) {
            console.error("Error writing to output file:", err);
            return;
          }
          console.log("Output file created successfully.");
        });
      });
    });
  }

  function handleGeneration(event) {
    loadWorkspace(event.target);
    let code = (code += pythonGenerator.workspaceToCode(
      Blockly.getMainWorkspace()
    ));

    outputGeneratedCode(
      "./header.py",
      "./footer.py",
      code,
      "./generatedScript.py"
    );

    /*
    try {
      eval(code);
    } catch (error) {
      console.log(error);
    }
    */
  }

  function save(button) {
    button.blocklySave = Blockly.serialization.workspaces.save(
      Blockly.getMainWorkspace()
    );
  }

  function loadWorkspace(button) {
    const workspace = Blockly.getMainWorkspace();
    if (button.blocklySave) {
      Blockly.serialization.workspaces.load(button.blocklySave, workspace);
    } else {
      workspace.clear();
    }
  }

  function handleSave() {
    document.body.setAttribute("mode", "edit");
    save(currentButton);
  }

  function enableEditMode() {
    document.body.setAttribute("mode", "edit");
    document.querySelectorAll(".button").forEach((btn) => {
      btn.removeEventListener("click", handleGeneration);
      btn.addEventListener("click", enableBlocklyMode);
    });
  }

  function enableMakerMode() {
    document.body.setAttribute("mode", "maker");
    document.querySelectorAll(".button").forEach((btn) => {
      btn.removeEventListener("click", handleGeneration);
      btn.addEventListener("click", enableBlocklyMode);
    });
  }

  function enableBlocklyMode(e) {
    document.body.setAttribute("mode", "blockly");
    currentButton = e.target;
    loadWorkspace(currentButton);
  }

  document.querySelector("#edit").addEventListener("click", enableEditMode);
  document.querySelector("#done").addEventListener("click", enableMakerMode);
  document.querySelector("#save").addEventListener("click", handleSave);

  enableMakerMode();

  // A toolbox definition specifies what blocks get included in the toolbox, and in what order
  const toolbox = await fetch("toolkit.json").json();

  /*
      Inject a Blockly workspace -- specify the location in 
      the DOM and configurations (name-value pairs)
  */
  // pass the ID
  Blockly.inject("blocklyDiv", {
    toolbox: toolbox,
    scrollbars: false,
    horizontalLayout: true,
    toolboxPosition: "top",
  });
})();
