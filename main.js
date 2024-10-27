/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// main.ts
__export(exports, {
  default: () => KanbanPlugin
});
var import_obsidian = __toModule(require("obsidian"));
var KanbanPlugin = class extends import_obsidian.Plugin {
  async onload() {
    console.log("Kanban Plugin \uB85C\uB4DC\uB428");
    this.registerEvent(this.app.vault.on("modify", this.onModify.bind(this)));
  }
  async onModify(file) {
    if (file.extension !== "md")
      return;
    const content = await this.app.vault.read(file);
    if (!content.includes("## Not started") || !content.includes("## In progress") || !content.includes("## Done")) {
      return;
    }
    let lines = content.split("\n");
    let tasks = [];
    let taskStatusChanged = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().match(/^(- \[( |\/|x)\] .+)/)) {
        tasks.push({ line: lines[i], index: i });
      }
    }
    for (let task of tasks) {
      let match = task.line.match(/^- \[( |\/|x)\] (.*)/);
      if (match) {
        let status = match[1];
        let taskText = match[2];
        let desiredSection = "";
        if (status === " ") {
          desiredSection = "Not started";
        } else if (status === "/") {
          desiredSection = "In progress";
        } else if (status === "x") {
          desiredSection = "Done";
        }
        let currentSection = this.getTaskSection(lines, task.index);
        if (currentSection !== desiredSection) {
          lines.splice(task.index, 1);
          for (let t of tasks) {
            if (t.index > task.index) {
              t.index--;
            }
          }
          let insertIndex = this.findSectionInsertIndex(lines, desiredSection);
          if (insertIndex !== -1) {
            lines.splice(insertIndex, 0, task.line);
            taskStatusChanged = true;
            for (let t of tasks) {
              if (t.index >= insertIndex) {
                t.index++;
              }
            }
          } else {
            console.error(`\uC139\uC158 '${desiredSection}'\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
          }
        }
      }
    }
    if (taskStatusChanged) {
      const newContent = lines.join("\n");
      await this.app.vault.modify(file, newContent);
    }
  }
  getTaskSection(lines, index) {
    for (let i = index - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith("##")) {
        return line.replace("##", "").trim();
      }
    }
    return "";
  }
  findSectionInsertIndex(lines, sectionName) {
    let sectionIndex = lines.findIndex((line) => line.trim() === "## " + sectionName);
    if (sectionIndex === -1) {
      return -1;
    }
    let insertIndex = sectionIndex + 1;
    while (insertIndex < lines.length && lines[insertIndex].trim() !== "" && !lines[insertIndex].trim().startsWith("##") && !lines[insertIndex].trim().match(/^(- \[( |\/|x)\] .+)/)) {
      insertIndex++;
    }
    return insertIndex;
  }
  onunload() {
    console.log("Kanban Plugin \uC5B8\uB85C\uB4DC\uB428");
  }
};
