import { App, PluginSettingTab } from "obsidian";

import NodeFactor from "main";

import ManualSetting from "./manual";
import ProgrameticalSetting from "./programetical";

export default class NodeFactorSettingTab extends PluginSettingTab {
	private plugin: NodeFactor;

	constructor(app: App, plugin: NodeFactor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { plugin, containerEl, app } = this;
		containerEl.empty();

		new ProgrameticalSetting(plugin, containerEl).display();

		new ManualSetting(app, plugin, containerEl, () =>
			this.display(),
		).display();
	}
}
