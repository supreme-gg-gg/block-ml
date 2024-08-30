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

pythonGenerator.forBlock["use_label"] = function (block) {
  const target = block.getFieldValue("target_column");
  return `assert ("${target}" in data.columns), "Specified target column not found"\n
  target_label = ${target}\ndata_y = data[target_label]\n
  data.drop([target_label, axis=1])`;
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
  // "data" will be used always for training even if there is no testing split required
  return `
  data, data_y, test_data test_y = train_test_split(data, data_y, test_size=${
    1 - ratio
  }, shuffle=${shuffle}, random_state=${randomState})\n`;
};

// =========== CATEGORY TWO: TRAIN, OPTIMIZE, EVALUATE ============

pythonGenerator.forBlock["train_setup"] = function (block) {
  const batch = block.getFieldValue("batch_size");
  const epoch = block.getFieldValue("epoch");
  const validation = block.getFieldValue("validation_split");

  let code = `batch_size, epoch, validation_ratio = ${batch}, ${epoch}, ${validation}\n`;
  code += `history = model.fit(data, data_y, epoch=epoch, batch_size=batch_size, validation_split=validation_ratio)\n`;
  return code;
};

pythonGenerator.forBlock["compile_model"] = function (block) {
  const optimizer = block.getFieldValue("OPTIMIZER");
  const lossFunction = block.getFieldValue("LOSS_FUNCTION");
  const metrics = block.getFieldValue("METRICS");

  return `model.compile(optimizer='${optimizer}', loss='${lossFunction}', metrics=['${metrics}'])\n`;
};

pythonGenerator.forBlock["evaluate_model"] = function (block) {
  return `evaluate_model(test_data)\n`;
};

pythonGenerator.forBlock["plot_history"] = function (block) {
  const metrics = block.getFieldValue("METRICS");
  return `plot_history(${metrics}, history)\n`;
};

pythonGenerator.forBlock["accuracy_summary"] = function (block) {
  const show_final_acc = block.getFieldValue("SHOW_FINAL_ACC") == "TRUE";
  const show_acc_over_time =
    block.getFieldValue("SHOW_ACC_OVER_TIME") == "TRUE";
  return `show_accuracy(history, ${show_final_acc}, ${show_acc_over_time})\n`;
};

pythonGenerator.forBlock["confusion_matrix"] = function (block) {
  const filePathBlock = block.getInputTargetBlock("LABELS");
  const labels = filePathBlock
    ? filePathBlock.getFieldValue("ARRAY")
    : "['1', '2', '3']";
  let code = "";
  code += "y_true = data_test[target_label]\n";
  code += "y_pred = model.predict(test_data)\n";
  return `plot_confusion_matrix(data_y, y_pred, ${labels})\n`;
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

// ========== CATEGORY FOUR: OUTPUT ==============

pythonGenerator.forBlock["predict"] = function (block) {
  const filePathBlock = block.getInputTargetBlock("file_path");
  if (!filePathBlock) {
    return `assert False, "No prediction dataset provided"`;
  }
  const filePath = filePathBlock.getFieldValue("file_path");
  const data_type = block.getFieldValue("data_type");
  return `data_predict = load_data(${filePath}, ${data_type})\nmodel.predict(data_predict)\n`;
};

pythonGenerator.forBlock["export_model"] = function (block) {
  const format = block.getFieldValue("FORMAT");
  const filePathBlock = block.getInputTargetBlock("file_path");
  const filePath = filePathBlock
    ? filePathBlock.getFieldValue("file_path")
    : "trained_model.hdf5";
  const includeOptimizer = block.getFieldValue("INCLUDE_OPTIMIZER") == "TRUE";

  return `export_model(model, ${filePath}, ${format}, ${includeOptimizer})\n`;
};

pythonGenerator.forBlock["serve_model"] = function () {
  return `print("Model has been served... (will be developed)")`;
};

export { pythonGenerator };
