import { Plugin } from "obsidian";

import { ObsidianNode, NodeFactorSettings, DEFAULT_SETTINGS } from "./types";
import SampleSettingTab from "./settings";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;

	// stops loop when graph isn't open
	private updateLoop: boolean;

	// This is a hash map that helps in specifically optimizing the forward tree
	private treeOptimizeMap: Map<string, number> = new Map();

	// This array helps in optimizing the whole calculation process
	private storedSized: Array<number> = [];

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				const leaf = this.app.workspace
					.getLeavesOfType("graph")
					.first();
				if (!leaf) {
					this.updateLoop = false;
					return;
				}
				this.updateLoop = true;

				// @ts-ignore
				const nodes: ObsidianNode[] = leaf.view.renderer.nodes;
				if (nodes.length === 0) return;

				this.calcLoop(nodes);
			}),
		);

		// clear cache when there is change in the vault
		this.registerEvent(
			this.app.vault.on("create", () => (this.storedSized = [])),
		);
		this.registerEvent(
			this.app.vault.on("modify", () => (this.storedSized = [])),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => (this.storedSized = [])),
		);
		this.registerEvent(
			this.app.vault.on("rename", () => (this.storedSized = [])),
		);
	}

	async onunload() {
		this.updateLoop = false;
	}

	private calcLoop(nodes: ObsidianNode[]) {
		setTimeout(() => {
			this.updateNodes(nodes);
			if (this.updateLoop) this.calcLoop(nodes);
		}, 10);
	}

	private updateNodes(nodes: ObsidianNode[]) {
		this.treeOptimizeMap.clear();
		nodes.forEach((node, i) => {
			let weight: number;
			if (this.storedSized[i] != undefined) {
				weight = this.storedSized[i];
			} else {
				weight = this.calcNodeWeight(node);
				this.storedSized[i] = weight;
			}
			node.weight = weight;
		});
	}

	private calcNodeWeight(node: ObsidianNode): number {
		const settings = this.settings;
		let weight = 0;

		weight += Object.keys(node.reverse).length * settings.bwdMultiplier;
		if (settings.fwdTree) {
			weight +=
				this.fwdNodeTreeSize(node, node.id) * settings.fwdMultiplier;
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
		if (!file || file.extension != "md") return 0;

		return file.stat.size;
	}

	private fwdNodeTreeSize(node: ObsidianNode, id: string): number {
		let size = 0;

		const sizeMap = this.treeOptimizeMap.get(node.id);
		if (sizeMap !== undefined) {
			return sizeMap as number;
		}

		Object.entries(node.forward).forEach(([key, value]) => {
			// @ts-ignore
			const childNode: ObsidianNode = value.target;

			// Prevents looping if A -> B -> C -> A
			if (key === id) return size;

			size++;
			const childSize = this.fwdNodeTreeSize(childNode, id);
			size += childSize;
		});

		this.treeOptimizeMap.set(node.id, size);
		return size;
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
