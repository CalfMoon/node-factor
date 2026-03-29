import { App, AbstractInputSuggest } from "obsidian";

export default class FileSuggest extends AbstractInputSuggest<string> {
	private files: Array<string>;
	private inputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);

		this.inputEl = inputEl;
		this.files = this.app.vault.getFiles().map((file) => file.path);
	}

	getSuggestions(inputStr: string): string[] {
		const inputLower = inputStr.toLowerCase();

		return this.files.filter((file) =>
			file.toLowerCase().includes(inputLower),
		);
	}

	renderSuggestion(folder: string, el: HTMLElement): void {
		el.setText(folder);
	}

	selectSuggestion(folder: string): void {
		this.inputEl.value = folder;
		const event = new Event("input");
		this.inputEl.dispatchEvent(event);
		this.close();
	}
}
