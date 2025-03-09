import { Plugin } from "obsidian";

import { ObsidianNode, NodeFactorSettings, DEFAULT_SETTINGS } from "./types";
import SampleSettingTab from "./settings";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				const leaf = this.app.workspace
					.getLeavesOfType("graph")
					.first();
				if (!leaf) return;

				// @ts-ignore
				const nodes: ObsidianNode[] = leaf.view.renderer.nodes;
				if (nodes.length === 0) return;

				setInterval(() => {
					nodes.forEach((node) => {
						const weight = this.calcNodeWeight(node);
						node.weight = weight;
					});
				}, 1);
			}),
		);
	}

	private calcNodeWeight(node: ObsidianNode): number {
		const settings = this.settings;
		let weight = 0;

		weight += Object.keys(node.reverse).length * settings.bwdMultiplier;
		weight += Object.keys(node.forward).length * settings.fwdMultiplier;

		return weight;
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
