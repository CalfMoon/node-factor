import {
	App,
	ButtonComponent,
	Notice,
	PluginSettingTab,
	SearchComponent,
	Setting,
	SliderComponent,
} from "obsidian";

import NodeFactor from "./main";
import FileSuggest from "./file-suggest";
import { FileData } from "./types";

export default class NodeFactorSettingTab extends PluginSettingTab {
	plugin: NodeFactor;

	constructor(app: App, plugin: NodeFactor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Programatically Set Size")
			.setHeading();

		new Setting(containerEl)
			.setName("Forward link weight multiplier")
			.setDesc("Multiplier for forward links weight (0 to disable).")
			.addSlider((slider) => {
				slider
					.setLimits(0, 20, 1)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.fwdMultiplier)
					.onChange(async (value) => {
						this.plugin.settings.fwdMultiplier = value;
						await this.plugin.saveSettings();
						this.plugin.recalculateSize();
					});
			});

		new Setting(containerEl)
			.setName("Travel forward tree")
			.setDesc(
				"Travel forward and add all other nodes to determine final node size.",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.fwdTree)
					.onChange(async (value) => {
						this.plugin.settings.fwdTree = value;
						await this.plugin.saveSettings();
						this.plugin.recalculateSize();
					});
			});

		new Setting(containerEl)
			.setName("Backward link weight multiplier")
			.setDesc("Multiplier for backward links weight (0 to disable).")
			.addSlider((slider) => {
				slider
					.setLimits(0, 20, 1)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.bwdMultiplier)
					.onChange(async (value) => {
						this.plugin.settings.bwdMultiplier = value;
						await this.plugin.saveSettings();
						this.plugin.recalculateSize();
					});
			});

		new Setting(containerEl)
			.setName("Character per weight")
			.setDesc(
				"Add 1 weight to node size per no of given character (0 to disable).",
			)
			.addSlider((slider) => {
				slider
					.setLimits(0, 5000, 100)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.lettersPerWt)
					.onChange(async (value) => {
						this.plugin.settings.lettersPerWt = value;
						await this.plugin.saveSettings();
						this.plugin.recalculateSize();
					});
			});

		new Setting(containerEl).setName("Manually Set Weight").setHeading();

		let selectedWeight: SliderComponent;
		let selectedFile: SearchComponent;
		let submitButton: ButtonComponent;
		new Setting(containerEl)
			.setName("Add new weight")
			.setDesc("Weight added here overrides everything else.")
			.addSearch((search) => {
				new FileSuggest(this.app, search.inputEl);
				selectedFile = search;
				search
					.setPlaceholder("Enter File Name")
					.onChange(async (value) => {
						if (value != "") submitButton.setDisabled(false);
					});
			})
			.addSlider((slider) => {
				selectedWeight = slider;
				slider.setLimits(0, 100, 5).setDynamicTooltip().setValue(0);
			})
			.addButton((button) => {
				submitButton = button;
				button
					.setDisabled(true)
					.setButtonText("Add")
					.setTooltip("Click to add")
					.onClick(async () => {
						const enteredFileData: FileData = {
							id: selectedFile.getValue(),
							weight: selectedWeight.getValue(),
						};
						selectedWeight.setValue(0);
						selectedFile.setValue("");

						const fileExists = this.plugin.settings.manual.find(
							(foundFile) => {
								foundFile.id == enteredFileData.id;
							},
						);

						if (!fileExists) {
							new Notice(`That file's size has already been entered, 
								remove it first to change weight.`);
							return;
						}

						this.plugin.settings.manual.push(enteredFileData);
						await this.plugin.saveSettings();
						new Notice("Manual Size added");

						// Rerender display
						this.display();
						this.plugin.recalculateSize();
					});
			});

		// Display all manually added weights
		this.plugin.settings.manual.forEach((value: FileData) => {
			new Setting(containerEl)
				.setName(value.id)
				.setDesc(`Weight: ${String(value.weight)}`)
				.addButton((button) => {
					button
						.setIcon("trash")
						.setTooltip("Remove Manually added size")
						.onClick(async () => {
							this.plugin.settings.manual.remove(value);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		});
	}
}
