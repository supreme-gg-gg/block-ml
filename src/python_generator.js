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
  const use_bias = block.getFieldValue("use_bias") == "TRUE" ? "True" : "False";
  // another way to do this is to make a bunch of python helper functions createDenseLayer()
  return `keras.layers.Dense(${neurons}, activation=${activation}, use_bias=${use_bias}),\n`;
};

pythonGenerator.forBlock["sequential_group"] = function (block, generator) {
  const innerCode = generator.statementToCode(block, "layers"); // type input_statements
  return `model = keras.Sequential([\n${innerCode}])\n`;
};

export { pythonGenerator };
