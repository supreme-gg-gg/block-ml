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

  // load_data() is implemented in header.py
  // create variables to be used later in the python script
  // shape will be obtained without manual specificiation
  const type = block.getFieldValue("data_type");
  return `data = load_data("${filePath}", "${type}")\n`;
};

pythonGenerator.forBlock["use_label"] = function (block) {
  const target = block.getFieldValue("target_column");
  const categorical =
    block.getFieldValue("one_hot") == "TRUE" ? "True" : "False";
  const numClasses = block.getFieldValue("num_classes");
  return `target_label="${target}"\nnum_classes=${numClasses}\ndata, data_y = process_label(data, target_label, ${categorical}, num_classes)\n`;
};

pythonGenerator.forBlock["data_group"] = function (block, generator) {
  const innerCode = generator.statementToCode(block, "data_functions"); // type input_statements
  return `\ndef process_data(data):\n${innerCode}  return data\n\ndata = process_data(data)\n`;
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
  return `data, test_data, data_y, test_y = train_test_split(data, data_y, test_size=${
    1 - ratio
  }, shuffle=${shuffle}, random_state=${randomState})\n`;
};

// =========== CATEGORY TWO: TRAIN, OPTIMIZE, EVALUATE ============

pythonGenerator.forBlock["train_setup"] = function (block) {
  const batch = block.getFieldValue("batch_size");
  const epochs = block.getFieldValue("epoch");
  const validation = block.getFieldValue("validation_split");

  let code = `batch_size, epochs, validation_ratio = ${batch}, ${epochs}, ${validation}\n`;
  code += `History = model.fit(data, data_y, epochs=epochs, batch_size=batch_size, validation_split=validation_ratio)\n`;
  code += `history = History.history\n`;
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
  return `plot_history("${metrics}", history)\n`;
};

pythonGenerator.forBlock["accuracy_summary"] = function (block) {
  const show_final_acc =
    block.getFieldValue("SHOW_FINAL_ACC") == "TRUE" ? "True" : "False";
  const show_acc_over_time =
    block.getFieldValue("SHOW_ACC_OVER_TIME") == "TRUE" ? "True" : "False";
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

pythonGenerator.forBlock["input_layer"] = function (block) {
  return `keras.Input(shape=data.shape[1:]),\n`;
};

pythonGenerator.forBlock["dropout_layer"] = function (block) {
  const rate = block.getFieldValue("rate");
  return `keras.layers.Dropout(${rate}),\n`;
};

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
  let code = `y_pred = make_prediction("${filePath}", "${data_type}")\n`;
  if (block.getFieldValue("use_raw") != "TRUE") {
    code += `y_pred = convert_classes(y_pred)\n`;
  }
  return code;
};

pythonGenerator.forBlock["export_model"] = function (block) {
  const format = block.getFieldValue("FORMAT");
  const filePathBlock = block.getInputTargetBlock("file_path");
  const filePath = filePathBlock
    ? filePathBlock.getFieldValue("file_path")
    : "trained_model.hdf5";
  const includeOptimizer =
    block.getFieldValue("INCLUDE_OPTIMIZER") == "TRUE" ? "True" : "False";

  return `export_model(model, "${filePath}", "${format}", ${includeOptimizer})\n`;
};

pythonGenerator.forBlock["colab_download"] = function (block) {
  const filePathBlock = block.getInputTargetBlock("file_path");
  const filePath = filePathBlock
    ? filePathBlock.getFieldValue("file_path")
    : "predictions.csv";
  const type = block.getFieldValue("data_type");
  return `data = colab_download("${filePath}", "${type}", y_pred)\n`;
};

pythonGenerator.forBlock["serve_model"] = function () {
  return `print("Model has been served... (will be developed)")\n`;
};

export { pythonGenerator };
