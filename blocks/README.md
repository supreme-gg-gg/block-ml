# Usage

- We define all the blocks in JSON in the block-ml/blocks directory.
- The contents will be read as a JSON array and used to create custom block definition in blocks.js
- After defining custom blocks here, you must include them by setting `"type": "type-you-defined"` in toolbox.json (but no need to specify inputs etc)
- If you want to just customize existing blocks, go to toolkit.json and instead add fields there

## Colour Scheme

| Type                  | Colour |
| --------------------- | ------ |
| Neural network layers | Green  |
| Neural network groups | Purple |
| Input main            | Yellow |
| Data functions        | Red    |

## Todo

**Automate generation of the following**

- python generator skeleton (in src/python_generator.js)
- updating list of JSON files (just read all) in loadBlocks.js
- adding new blocks into toolbox.json

**ISSUES**

- better organisation: create y_train before splitting data helps to make x-train, x-test, y-train, y-test!!
- You can use a flag to simply mark the above process!

## Brief Documentation (to be refined)

- A train block must be preceeded by a compile block (somehow type check did not work will open issue)
- You must define the model (Sequential group for example) before using any train functions
- When evaluating model on test data, you must first have used split_data function/ block (issue will be opened)
- Dataset used to make prediction should match training data in terms of shape (features)
