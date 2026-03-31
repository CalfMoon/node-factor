import { Setting } from "obsidian";

import NodeFactor from "main";

export default class ProgrameticalSetting {
	private plugin: NodeFactor;
	private containerEl: HTMLElement;

	constructor(plugin: NodeFactor, containerEl: HTMLElement) {
		this.plugin = plugin;
		this.containerEl = containerEl;
	}

	display(): void {
		new Setting(this.containerEl)
			.setName("Programatically set size")
			.setHeading();

		const fwdLinkWt = new Setting(this.containerEl)
			.setName("Forward link weight multiplier")
			.setDesc("Multiplier for forward links weight (0 to disable).");

		fwdLinkWt.addSlider((slider) => {
			slider.setLimits(0, 20, 1);
			slider.setDynamicTooltip();
			slider.setValue(this.plugin.settings.fwdMultiplier);

			slider.onChange(async (value) => {
				this.plugin.settings.fwdMultiplier = value;
				await this.plugin.saveSettings();
				this.plugin.recalculateSize();
			});
		});

		const travelFwdTree = new Setting(this.containerEl)
			.setName("Travel forward tree")
			.setDesc(
				"Travel forward and add all other nodes to determine final node size.",
			);

		travelFwdTree.addToggle((toggle) => {
			toggle.setValue(this.plugin.settings.fwdTree);

			toggle.onChange(async (value) => {
				this.plugin.settings.fwdTree = value;
				await this.plugin.saveSettings();
				this.plugin.recalculateSize();
			});
		});

		const bwdLinkWt = new Setting(this.containerEl)
			.setName("Backward link weight multiplier")
			.setDesc("Multiplier for backward links weight (0 to disable).");

		bwdLinkWt.addSlider((slider) => {
			slider.setLimits(0, 20, 1);
			slider.setDynamicTooltip();
			slider.setValue(this.plugin.settings.bwdMultiplier);

			slider.onChange(async (value) => {
				this.plugin.settings.bwdMultiplier = value;
				await this.plugin.saveSettings();
				this.plugin.recalculateSize();
			});
		});

		const charWt = new Setting(this.containerEl)
			.setName("Character per weight")
			.setDesc(
				"Add 1 weight to node size per no of given character (0 to disable).",
			);

		charWt.addSlider((slider) => {
			slider.setLimits(0, 5000, 100);
			slider.setDynamicTooltip();
			slider.setValue(this.plugin.settings.lettersPerWt);

			slider.onChange(async (value) => {
				this.plugin.settings.lettersPerWt = value;
				await this.plugin.saveSettings();
				this.plugin.recalculateSize();
			});
		});
	}
}
