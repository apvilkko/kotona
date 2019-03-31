const fs = require("fs");
const path = require("path");
const input = require("./run.template.json");

for (let i = 0; i < input.length; ++i) {
  input[i].sourceDir = input[i].sourceDir.replace("PWD", path.resolve("./"));
}
fs.writeFileSync("./run.json", JSON.stringify(input));
