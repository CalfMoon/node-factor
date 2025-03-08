import { Plugin } from "obsidian";

import { NodeFactorSettings, DEFAULT_SETTINGS } from "./types";
import SampleSettingTab from "./settings";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerEvent(this.app.workspace.on("layout-change", () => {}));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
