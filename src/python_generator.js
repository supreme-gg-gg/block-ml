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

// ========= CATEGORY 1: Input And Data Processing =======

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

pythonGenerator.forBlock["data_group"] = function (block, generator) {
  const innerCode = generator.statementToCode(block, "data_functions"); // type input_statements
  return `def process_data(data):\n${innerCode}data = process_data(data)\n`;
};

pythonGenerator.forBlock["normalize_data"] = function (block) {
  const method = block.getFieldValue("normalize_method");
  let code = "";
  switch (method) {
    case "minmax":
      code += "scaler = MinMaxScaler()\n";
      break;

    case "zscore":
      code += "scaler = StandardScaler()\n";
      break;
  }
  code += "data = scaler.fit_transform(data)\n";
  return code;
};

pythonGenerator.forBlock["filter_rows"] = function (block) {
  const column = block.getFieldValue("column_name");
  const condition = block.getFieldValue("condition");
  const value = block.getFieldValue("value");
  return `data = data[data[${column}] ${condition} ${value}]\n`;
};

pythonGenerator.forBlock["group_by_column"] = function (block) {
  const groupBy = block.getFieldValue("group_by");
  const aggregateColumn = block.getFieldValue("aggregate_column");
  const aggregateMethod = block.getFieldValue("aggregate_method");
  return `data = data.groupby('${groupBy}').agg({ '${aggregateColumn}': '${aggregateMethod}' })\n`;
};

pythonGenerator.forBlock["split_data"] = function (block) {
  const ratio = block.getFieldValue("RATIO");
  const shuffle = block.getFieldValue("SHUFFLE") == "TRUE" ? "True" : "False";
  const randomState = block.getFieldValue("RANDOM_STATE");
  // data will be used always for training even if there is no testing split required
  return `data, test_data = train_test_split(data, test_size=${
    1 - ratio
  }, shuffle=${shuffle}, random_state=${randomState})\n`;
};

// =========== CATEGORY TWO: TRAIN, OPTIMIZE, EVALUATE ============

pythonGenerator.forBlock["train_setup"] = function (block) {
  const batch = block.getFieldValue("batch_size");
  const epoch = block.getFieldValue("epoch");
  const validation = block.getFieldValue("validation_split");

  let code = `batch_size, epoch, validation_ratio = ${batch}, ${epoch}, ${validation}\n`;
  if (block.getFieldValue("use_target") == "TRUE") {
    const target = block.getFieldValue("target_column");
    code += `assert ("${target}" in data.columns), "Specified target column not found"\n`;
    code += `y_train = data["${target}"]\n`;
    code += `data = data.drop(columns=["${target}"])\n`;
    code +=
      "history = model.fit(data, y_train, epoch=epoch, batch_size=batch_size, validation_split=validation_ratio)\n";
    return code;
  }
  code +=
    "history = model.fit(data, epoch=epoch, batch_size=batch_size, validation_split=validation_ratio)\n";
  return code;
};

pythonGenerator.forBlock["compile_model"] = function (block) {
  const optimizer = block.getFieldValue("OPTIMIZER");
  const lossFunction = block.getFieldValue("LOSS_FUNCTION");
  const metrics = block.getFieldValue("METRICS");

  return `model.compile(optimizer='${optimizer}', loss='${lossFunction}', metrics=['${metrics}'])\n`;
};

pythonGenerator.forBlock["evaluate_model"] = function (block) {
  return `score = evaluation = model.evaluate(test_data)\n`;
};

// ============ CATEGORY THREE: NEURAL NETWORK MODEL ==========

pythonGenerator.forBlock["dense_layer"] = function (block) {
  const neurons = block.getFieldValue("units");
  const activation = block.getFieldValue("activation_type");
  // field_checkbox returns STRING "TRUE" or "FALSE"
  const use_bias = block.getFieldValue("use_bias") == "TRUE" ? "True" : "False";
  // another way to do this is to make a bunch of python helper functions createDenseLayer()
  return `keras.layers.Dense(${neurons}, activation='${activation}', use_bias=${use_bias}),\n`;
};

pythonGenerator.forBlock["sequential_group"] = function (block, generator) {
  const innerCode = generator.statementToCode(block, "layers"); // type input_statements
  return `model = keras.Sequential([\n${innerCode}])\n`;
};

export { pythonGenerator };
