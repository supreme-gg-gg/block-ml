// Import Blockly core.
import * as Blockly from "blockly/core";
// Import the default blocks.
import * as libraryBlocks from "blockly/blocks";
// Import a message file.
import * as En from "blockly/msg/en";

// The generator is defined elsewhere
import { pythonGenerator } from "./python_generator";

// immediately invoked function expression (IIFE)
(async function () {
  let currentButton;
  Blockly.setLocale(En);

  // fs is not available on brower environment so we move it to server side and send requests
  // this is the generation handler function
  async function handleGeneration(event) {
    loadWorkspace(event.target);
    let code = pythonGenerator.workspaceToCode(Blockly.getMainWorkspace());
    const header = await fetch("/python/header.py");
    const footer = await fetch("/python/footer.py");
    let generatedCode = header + "\n" + code + "\n" + footer;

    try {
      const response = await fetch("/write/generatedCode.py", {
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generatedCode),
      });
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error generating code:", error);
    }

    /*
    try {
      eval(code);
    } catch (error) {
      console.log(error);
    }
    */
  }

  // the following functions handle workspace saving and buttons and modes
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

  // these functions load the blocks and register them
  const blockFiles = ["test.json", "dense.json", "sequential.json"]; // List of all JSON files

  // this method loads block by making fetch request to the server
  async function loadBlocks() {
    try {
      const blockPromises = blockFiles.map(async (file) => {
        const response = await fetch(`/blocks/${file}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch block: ${response.statusText}`);
        }
        return response.json();
      });

      // wait for all promises to resolve and return JSON array
      const blocksArray = await Promise.all(blockPromises);
      console.log(blocksArray);
      // pass the resolved array to Blockly
      Blockly.defineBlocksWithJsonArray(blocksArray);
    } catch (error) {
      console.error("Error loading block definitions:", error);
    }
  }

  loadBlocks();

  // finally we load the toolkit and inject the workspace
  // A toolbox definition specifies what blocks get included in the toolbox, and in what order
  const toolbox = await fetch("toolbox.json");
  const toolboxJson = await toolbox.json();

  /*
      Inject a Blockly workspace -- specify the location in 
      the DOM and configurations (name-value pairs)
  */
  // pass the ID
  Blockly.inject("blocklyDiv", {
    toolbox: toolboxJson,
    scrollbars: false,
    horizontalLayout: true,
    toolboxPosition: "top",
  });
})();
