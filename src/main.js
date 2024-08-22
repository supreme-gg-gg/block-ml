// Import Blockly core.
import * as Blockly from "blockly/core";
// Import the default blocks.
import * as libraryBlocks from "blockly/blocks";
// Import a message file.
import * as En from "blockly/msg/en";

// The generator is defined elsewhere
import { pythonGenerator } from "./python_generator";

import { loadBlocks } from "./loadBlocks";

// immediately invoked function expression (IIFE)
(async function () {
  let currentButton;
  Blockly.setLocale(En);

  // fs is not available on brower environment so we move it to server side and send requests
  async function handleGeneration(event) {
    // loadWorkspace(event.target);
    let code = pythonGenerator.workspaceToCode(Blockly.getMainWorkspace());
    const headerResponse = await fetch("/python/header.py");
    const header = await headerResponse.text();
    const footerResponse = await fetch("/python/footer.py");
    const footer = await footerResponse.text();
    let generatedCode = header + "\n" + code + "\n" + footer;

    try {
      const response = await fetch("/write/generatedCode.py", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: generatedCode }),
      });
      const result = await response.text();
      document.getElementById("text-area").value = result;
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

  /*
    This is how we managed to dynamically update the webpage even though there is only one index.html
    We use different modes on the same webpage and shows the home page buttons or the editor page selectively
    The generate button should not be active in edit or maker mode (so remove EventListener)
  */

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
  document
    .querySelector("#generate")
    .addEventListener("click", handleGeneration);

  enableMakerMode();

  loadBlocks();

  // A toolbox definition specifies what blocks get included in the toolbox, and in what order
  // this fetching works because toolbox.json is placed in public and served as static files
  // compare it to blocks/ JSONs which are not static but dynamically loaded via fetch requests to server!
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
    verticalLayout: true,
    toolboxPosition: "left",
  });

  const supportedEvents = new Set([
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_CREATE,
    Blockly.Events.BLOCK_DELETE,
    Blockly.Events.BLOCK_MOVE,
  ]);

  function updateCode(event) {
    // get the top layer workspace for multiple Blockly instances
    const workspace = Blockly.getMainWorkspace();
    if (workspace.isDragging()) return;
    if (!supportedEvents.has(event.type)) return;
    const code = pythonGenerator.workspaceToCode(workspace);
    document.getElementById("text-area").value = code;
  }

  Blockly.getMainWorkspace().addChangeListener(updateCode);
})();
