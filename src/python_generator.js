import { pythonGenerator } from "blockly/python";

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

export { pythonGenerator };
