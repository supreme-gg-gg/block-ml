const Blockly = require("blockly/core");
const { pythonGenerator } = require("blockly/python");
const blockFiles = ["dense.json", "sequential.json"]; // List of all JSON files
const blocksDirectory = "../blocks/"; // Path to the blocks directory

// Function to load a single JSON file
function loadJSON(file) {
  return fetch(blocksDirectory + file).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${file}: ${response.statusText}`);
    }
    return response.json();
  });
}

// Load all JSON files and combine them into a single array
function loadAllBlocks() {
  return Promise.all(blockFiles.map(loadJSON))
    .then((jsonArray) => {
      // jsonArray is an array of JSON objects from the files
      console.log("Combined JSON Array:", jsonArray);
      return jsonArray;
    })
    .catch((error) => {
      console.error("Error loading JSON files:", error);
    });
}

// not sure if the JSON file works need to trial and error first...
const blockDefinitions = loadAllBlocks(); // this loads a JsonArray from the folder "blocks"
const definitions =
  Blockly.common.createBlockDefinitionsFromJsonArray(blockDefinitions);
Blockly.common.defineBlocks(definitions);

// Each block has an associated block-code generator that defines what code it generates.
// It has to be defined for each language you want to generate

pythonGenerator.forBlock["dense_layer"] = function (block) {
  const neurons = block.getFieldValue("neurons_number");
  const activation = block.getFieldValue("activation_type");
  const use_bias = block.getFieldValue("use_bias") == "TRUE" ? "True" : "False";
  // another way to do this is to make a bunch of python helper functions createDenseLayer()
  return `model.add(keras.layers.Dense(${neurons}, activation=${activation}, use_bias=${use_bias}));\n`;
};

pythonGenerator.forBlock["sequential_group"] = function (block) {
  const number_of_layers = block.getFieldValue("number_of_layers");
  return `model = keras.Sequential()`;
};
