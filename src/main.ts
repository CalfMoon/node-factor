import { Plugin } from "obsidian";

import { ObsidianNode, NodeFactorSettings, DEFAULT_SETTINGS } from "./types";
import NodeFactorSettingTab from "./settings";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;

	private nodes: Array<ObsidianNode>;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NodeFactorSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				const leaf = this.app.workspace
					.getLeavesOfType("graph")
					.first();
				// exit loop if the loaded page isn't grah
				if (!leaf) return;

				// @ts-ignore
				this.nodes = leaf.view.renderer.nodes;
				if (this.nodes.length === 0) return;

				this.updateGraph();
			}),
		);

		// clear cache when there is change in the vault
		this.app.workspace.onLayoutReady(() => {
			// layout ready is required because obsidian calls
			// create for every existing file when initally loading obsidian
			// https://docs.obsidian.md/plugins/guides/load-time#Pitfalls
			this.registerEvent(
				this.app.vault.on("create", () => this.clearSizeCache()),
			);
		});
		this.registerEvent(
			this.app.vault.on("modify", () => this.clearSizeCache()),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => this.clearSizeCache()),
		);
		this.registerEvent(
			this.app.vault.on("rename", () => this.clearSizeCache()),
		);
	}

	async onunload() {
		// clearInterval(this.loopId);
	}

	private sizeCache: Map<string, number> = new Map();
	private updateGraph() {
		const nodes = this.nodes;
		setTimeout(() => {
			nodes.forEach((node, _i) => {
				let weight = 0;
				if (this.sizeCache.get(node.id) != undefined) {
					weight = this.sizeCache.get(node.id) as number;
				} else {
					weight = this.calcNodeWeight(node);
					this.sizeCache.set(node.id, weight);
				}
				node.weight = weight;
			});
		}, 500);
	}

	private calcNodeWeight(node: ObsidianNode): number {
		const settings = this.settings;
		let weight = 0;

		weight += Object.keys(node.reverse).length * settings.bwdMultiplier;
		if (settings.fwdTree) {
			weight +=
				this.fwdNodeTreeSize(node, new Set()) * settings.fwdMultiplier;
		} else {
			weight += Object.keys(node.forward).length * settings.fwdMultiplier;
		}

		if (settings.lettersPerWt != 0) {
			weight += this.letterCount(node) / settings.lettersPerWt;
		}

		return Math.round(weight);
	}

	private letterCount(node: ObsidianNode): number {
		const file = this.app.vault.getFileByPath(node.id);
		if (file == null || file.extension != "md") return 0;

		return file.stat.size;
	}

	private fwdNodeTreeSize(
		node: ObsidianNode,
		antiLoopSet: Set<string>,
	): number {
		let size = 0;
		antiLoopSet.add(node.id);

		Object.entries(node.forward).forEach(([key, value]) => {
			// @ts-ignore
			const childNode: ObsidianNode = value.target;

			// Prevents looping if A -> B -> C -> D -> B
			if (antiLoopSet.has(key)) return size;

			size++;
			const childSize = this.fwdNodeTreeSize(childNode, antiLoopSet);
			size += childSize;
		});

		return size;
	}

	clearSizeCache() {
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
