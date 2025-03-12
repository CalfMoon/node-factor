import { App, PluginSettingTab, Setting } from "obsidian";

import NodeFactor from "./main";

export default class SampleSettingTab extends PluginSettingTab {
	plugin: NodeFactor;

	constructor(app: App, plugin: NodeFactor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Forward link weight multiplier")
			.setDesc("Multiplier for forward links weight (0 to diable).")
			.addSlider((slider) =>
				slider
					.setLimits(0, 20, 1)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.fwdMultiplier)
					.onChange(async (value) => {
						this.plugin.settings.fwdMultiplier = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Travel forward tree")
			.setDesc("Travel forward tree to calcuate node size.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.fwdTree)
					.onChange(async (value) => {
						this.plugin.settings.fwdTree = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Backward link weight multiplier")
			.setDesc("Multiplier for backward links weight (0 to diable).")
			.addSlider((slider) =>
				slider
					.setLimits(0, 20, 1)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.bwdMultiplier)
					.onChange(async (value) => {
						this.plugin.settings.bwdMultiplier = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Character per weight")
			.setDesc(
				"Add 1 weight to node size per no of given Character (0 to disable).",
			)
			.addSlider((slider) =>
				slider
					.setLimits(0, 5000, 100)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.lettersPerWt)
					.onChange(async (value) => {
						this.plugin.settings.lettersPerWt = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
