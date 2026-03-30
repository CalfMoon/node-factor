import {
	App,
	ButtonComponent,
	Notice,
	SearchComponent,
	Setting,
	SliderComponent,
} from "obsidian";

import NodeFactor from "main";
import { FileData } from "types";

import FileSuggest from "./file-suggest";

export default class ManualSetting {
	private app: App;
	private plugin: NodeFactor;
	private containerEl: HTMLElement;
	private refreshDisplay: () => void;

	constructor(
		app: App,
		plugin: NodeFactor,
		containerEl: HTMLElement,
		refreshDisplay: () => void,
	) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = containerEl;
		this.refreshDisplay = refreshDisplay;
	}

	display(): void {
		new Setting(this.containerEl).setName("Manually set size").setHeading();

		let selectedWeight: SliderComponent;
		let selectedFile: SearchComponent;
		let submitButton: ButtonComponent;

		const addWt = new Setting(this.containerEl)
			.setName("Add new weight")
			.setDesc("Weight added here overrides everything else.");

		addWt.addSearch((search) => {
			new FileSuggest(this.app, search.inputEl);
			selectedFile = search;
			search.setPlaceholder("Enter file name");
			search.onChange(async (value) => {
				submitButton.setDisabled(value.length === 0);
			});
		});

		addWt.addSlider((slider) => {
			selectedWeight = slider;
			slider.setLimits(0, 100, 5);
			slider.setDynamicTooltip();
			slider.setValue(0);
		});

		addWt.addButton((button) => {
			submitButton = button;
			button.setDisabled(true);
			button.setButtonText("Add");
			button.setTooltip("Click to add new manual size");

			button.onClick(async () => {
				const enteredFileData: FileData = {
					id: selectedFile.getValue(),
					weight: selectedWeight.getValue(),
				};
				selectedWeight.setValue(0);
				selectedFile.setValue("");

				const fileExists = this.plugin.settings.manual.find(
					(foundFile) => foundFile.id == enteredFileData.id,
				);

				if (!fileExists) {
					new Notice(`That file's size has already been entered, 
								remove it first to change weight.`);
					return;
				}

				this.plugin.settings.manual.push(enteredFileData);
				await this.plugin.saveSettings();
				new Notice("New size added manually");

				this.refreshDisplay();
				this.plugin.recalculateSize();
			});
		});

		// Display all manually added weights & option to remove them
		this.plugin.settings.manual.forEach((value: FileData) => {
			const manualDisplay = new Setting(this.containerEl)
				.setName(value.id)
				.setDesc(`Weight: ${String(value.weight)}`);

			manualDisplay.addButton((button) => {
				button.setIcon("trash");
				button.setTooltip("Remove manually added size");

				button.onClick(async () => {
					this.plugin.settings.manual.remove(value);
					await this.plugin.saveSettings();
					this.refreshDisplay();
				});
			});
		});
	}
}
