# MLock -- Block-based Machine Learning

Struggling...

## Dev Resources

[I should have started with these beginner intuitive helpful tutorials!][1]

[The documentation is a bit too dense lol][2]

[Why do I feel like we are bulding a GUI for Keras lmao][3]

[1]: https://blocklycodelabs.dev
[2]: https://developers.google.com/blockly/guides/get-started/what-is-blockly
[3]: https://www.tensorflow.org/api_docs/python/tf/keras

## Environment setup

**You would not be able to run anything without first enabling npm and dependent modules**

```
npm install
node server.js
npx webpack
```

- `npm install` downloads all the node_modules specified as dependencies in `package.json`
- During development the files are put under src/ for webpack to generate dist/bundle.js.
- Then we will move them to public/ with bundle.js so node.js can serve them properly

## Easier workflow?

- Make webpack recompile bundle.js automatically when a change is detected in the src/ folder
  - `npx webpack --watch` will use Webpack's `webpack-dev-server`
- Nodemon: automatically restart the node.js server when changes are made to server-side files like server.js
  - Instead of `node server.js`, run `nodemon server.js`
- Changes to the JSON blocks and static files in public/ are automatically updated by the server
