# Usage

- We define all the blocks in JSON in the block-ml/blocks directory.
- The contents will be read as a JSON array and used to create custom block definition in blocks.js
- After defining custom blocks here, you must include them by setting `"type": "type-you-defined"` in toolbox.json (but no need to specify inputs etc)
- If you want to just customize existing blocks, go to toolkit.json and instead add fields there
