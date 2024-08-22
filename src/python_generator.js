import { pythonGenerator } from "blockly/python";
import * as Blockly from "blockly/core";

// Each block has an associated block-code generator that defines what code it generates.
// It has to be defined for each language you want to generate

/*
  Using code generator:
  1. Import and setup 
  2. Define code for individual blocks (done in)
  3. Generation: end-user requests or continously (event listener)
  4. Add preamble or postscript code
  6. Execute genrated code (for us we use Google Colab)
*/

pythonGenerator.forBlock["dense_layer"] = function (block) {
  const neurons = block.getFieldValue("units");
  const activation = block.getFieldValue("activation_type");
  // field_checkbox returns STRING "TRUE" or "FALSE"
  const use_bias = block.getFieldValue("use_bias") == "TRUE" ? "True" : "False";
  // another way to do this is to make a bunch of python helper functions createDenseLayer()
  return `keras.layers.Dense(${neurons}, activation=${activation}, use_bias=${use_bias}),\n`;
};

pythonGenerator.forBlock["sequential_group"] = function (block, generator) {
  const innerCode = generator.statementToCode(block, "layers"); // type input_statements
  return `model = keras.Sequential([\n${innerCode}])\n`;
};

pythonGenerator.forBlock["input_main"] = function (block) {
  // get the file path of the data first
  const filePathBlock = block.getInputTargetBlock("file_path");
  const filePath = filePathBlock
    ? filePathBlock.getFieldValue("file_path")
    : "sample.csv";
  const shape = block.getFieldValue("shape");

  // load_data() is implemented in header.py
  // create variables to be used later in the python script
  const type = block.getFieldValue("data_type");
  return `data = load_data("${filePath}", "${type}")\nshape = ${shape}\n`;
};

pythonGenerator.forBlock["train_setup"] = function (block) {
  const batch = block.getFieldValue("batch_size");
  let code = `batch = ${batch}\n`;
  if (block.getFieldValue("use_target") == "TRUE") {
    const target = block.getFieldValue("target_column");
    code += `assert ("${target}" in data.columns), "Specified target column not found"\n`;
    code += `y = data["${target}"]\n`;
  }
  return code;
};

export { pythonGenerator };
