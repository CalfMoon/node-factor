export interface NodeFactorSettings {
	fwdMultiplier: number;
	fwdTree: boolean;

	bwdMultiplier: number;

	lettersPerWt: number;
}

export const DEFAULT_SETTINGS: NodeFactorSettings = {
	fwdMultiplier: 1,
	fwdTree: false,

	bwdMultiplier: 1,

	lettersPerWt: 0,
};
