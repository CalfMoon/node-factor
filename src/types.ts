export interface ObsidianNode {
	id: string;
	weight: number;
	forward: object;
	reverse: object;
}

export interface NodeFactorSettings {
	fwdMultiplier: number;
	fwdTree: boolean;

	bwdMultiplier: number;

	lettersPerWt: number;

	manual: Array<FileData>;
}

export interface FileData {
	id: string;
	weight: number;
}

export const DEFAULT_SETTINGS: NodeFactorSettings = {
	fwdMultiplier: 1,
	fwdTree: false,

	bwdMultiplier: 1,

	lettersPerWt: 0,

	manual: new Array<FileData>(),
};
