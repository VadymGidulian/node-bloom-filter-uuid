interface VariantDescription {
	/**
	 * Number of hash functions
	 */
	k: number;
	/**
	 * Number of bits
	 */
	m: number;
	/**
	 * Size in memory
	 */
	bufferSize: number;
	/**
	 * Calculates approximate false positive probability of the variant
	 * with specified desired number of inserted elements.
	 * @param n - Number of elements
	 */
	calcE: (n: number) => number;
	/**
	 * Calculates approximate number of elements that could be inserted
	 * with specified desired false positive probability of the variant.
	 * @param e - Desired false positive probability
	 */
	calcN: (e: number) => number;
}

export default class BloomFilter {
	
	buffers: Buffer[];
	variant: number;
	
	/**
	 * Returns information about a variant.
	 *
	 * @param variant - Filter variant
	 */
	static describeVariant(variant: number): VariantDescription;
	
	/**
	 * Prints help.
	 */
	static printHelp(): void;
	
	/**
	 * @param variant - Filter variant
	 */
	constructor(variant: number);
	
	/**
	 * Adds an element to the set.
	 *
	 * @param uuid - UUID
	 */
	add(uuid: string): void;
	
	/**
	 * Tests whether an element is in the set.
	 *
	 * @param uuid - UUID
	 */
	has(uuid: string): boolean;
	
}
