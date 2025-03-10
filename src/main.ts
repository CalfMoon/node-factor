import { Plugin } from "obsidian";

import { ObsidianNode, NodeFactorSettings, DEFAULT_SETTINGS } from "./types";
import SampleSettingTab from "./settings";

export default class NodeFactor extends Plugin {
	settings: NodeFactorSettings;
	updateLoop: boolean;

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

				const treeOptimizeMap: Map<string, number> = new Map();
				nodes.forEach((node) => {
					const weight = this.calcNodeWeight(node, treeOptimizeMap);
					node.weight = weight;
				});

				// this.calcLoop(nodes);

				console.log(performance.now() - start);
			}),
		);
	}

	private calcLoop(nodes: ObsidianNode[]) {
		setTimeout(() => {
			const treeOptimizeMap: Map<string, number> = new Map();
			nodes.forEach((node) => {
				const weight = this.calcNodeWeight(node, treeOptimizeMap);
				node.weight = weight;
			});
			if (this.updateLoop) this.calcLoop(nodes);
		}, 10);
	}

	private calcNodeWeight(
		node: ObsidianNode,
		treeOptimizeMap: Map<string, number>,
	): number {
		const settings = this.settings;
		let weight = 0;

		weight += Object.keys(node.reverse).length * settings.bwdMultiplier;
		if (settings.fwdTree) {
			weight +=
				this.fwdNodeTreeSize(node, node.id, treeOptimizeMap) *
				settings.fwdMultiplier;
		} else {
			weight += Object.keys(node.forward).length * settings.fwdMultiplier;
		}

		return weight;
	}

	private fwdNodeTreeSize(
		node: ObsidianNode,
		id: string,
		treeOptimizeMap: Map<string, number>,
	): number {
		let size = 0;

		const sizeMap = treeOptimizeMap.get(node.id);

		// the block below
		if (sizeMap !== undefined) {
			return sizeMap as number;
		}

		Object.entries(node.forward).forEach(([key, value]) => {
			// @ts-ignore
			const childNode: ObsidianNode = value.target;

			// Prevents looping if A -> B -> C -> A
			if (key === id) return size;

			size++;
			const childSize = this.fwdNodeTreeSize(
				childNode,
				id,
				treeOptimizeMap,
			);
			size += childSize;
		});

		treeOptimizeMap.set(node.id, size);
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
