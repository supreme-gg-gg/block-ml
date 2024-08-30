import * as Blockly from "blockly/core";
import "@blockly/field-grid-dropdown";

// these functions load the blocks and register them
const blockFiles = [
  "dense.json",
  "sequential.json",
  "input.json",
  "text-input.json",
  "train-setup.json",
  "normalize.json",
  "group-column.json",
  "split-data.json",
  "filter-rows.json",
  "data.json",
  "compile-model.json",
  "evaluate-model.json",
  "accuracy.json",
  "array-input.json",
  "confusion-matrix.json",
  "export-model.json",
  "history-plot.json",
  "serve-model.json",
  "predict.json",
  "use-label.json",
]; // List of all JSON files

// this method loads block by making fetch request to the server
export async function loadBlocks() {
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
    // pass the resolved array to Blockly
    Blockly.defineBlocksWithJsonArray(blocksArray);
  } catch (error) {
    console.error("Error loading block definitions:", error);
  }
}

// CommonJS syntax: module.exports and require()
// ES Modules: export and import <- we will use this one!!
