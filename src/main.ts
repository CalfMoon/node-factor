import { Plugin } from "obsidian";

import { ObsidianNode, NodeFactorSettings, DEFAULT_SETTINGS } from "types";
import NodeFactorSettingTab from "settings";
import Calculator from "calculator";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NodeFactorSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () =>
				this.updateGraph(),
			),
		);
		this.registerEvent(
			this.app.workspace.on("layout-change", () => this.updateGraph()),
		);

		// clear cache when there is change in the vault
		this.app.workspace.onLayoutReady(() => {
			// layout ready is required because obsidian calls
			// create for every existing file when initally loading obsidian
			// https://docs.obsidian.md/plugins/guides/load-time#Pitfalls
			this.registerEvent(
				this.app.vault.on("create", () => this.recalculateSize()),
			);
		});
		this.registerEvent(
			this.app.vault.on("modify", () => this.recalculateSize()),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => this.recalculateSize()),
		);
		this.registerEvent(
			this.app.vault.on("rename", () => this.recalculateSize()),
		);
	}

	onunload() {}

	private sizeCache: Map<string, number> = new Map();
	private timeoutId: NodeJS.Timeout;
	private updateGraph() {
		const leaf = this.app.workspace.getLeavesOfType("graph").first();
		// don't run if graph page isn't loaded
		if (!leaf) return;

		// @ts-ignore
		const nodes: Array<ObsidianNode> = leaf.view.renderer.nodes;
		if (nodes.length === 0) return;

		// Slight delay in calculations is needed to fix node size
		// if graph view is initially opened when opening obsidian
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => {
			const calculator = new Calculator(this.app, this.settings);

			nodes.forEach((node, _i) => {
				let weight = 0;
				if (this.sizeCache.get(node.id) != undefined) {
					weight = this.sizeCache.get(node.id) as number;
				} else {
					weight = calculator.calcNodeWeight(node);
					this.sizeCache.set(node.id, weight);
				}
				node.weight = weight;
			});
		}, 500);
	}

	recalculateSize() {
		this.sizeCache.clear();
		this.updateGraph();
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
