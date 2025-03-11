import { Plugin } from "obsidian";

import { ObsidianNode, NodeFactorSettings, DEFAULT_SETTINGS } from "./types";
import SampleSettingTab from "./settings";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;

	// stops loop when graph isn't open
	updateLoop: boolean;

	// This is a hash map that helps in specifically optimizing the forward tree
	treeOptimizeMap: Map<string, number> = new Map();
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

				const start = performance.now();

				nodes.forEach((node) => {
					const weight = this.calcNodeWeight(node);
					node.weight = weight;
				});

				// this.calcLoop(nodes);

				console.log(performance.now() - start);
			}),
		);
	}

	private calcLoop(nodes: ObsidianNode[]) {
		setTimeout(() => {
			nodes.forEach((node) => {
				const weight = this.calcNodeWeight(node);
				node.weight = weight;
			});
			if (this.updateLoop) this.calcLoop(nodes);
		}, 10);
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
