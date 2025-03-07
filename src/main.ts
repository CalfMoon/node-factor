import { Plugin } from "obsidian";

export default class NodeFactor extends Plugin {
	async onload() {
		this.registerEvent(this.app.workspace.on("layout-change", () => {}));
	}
}
