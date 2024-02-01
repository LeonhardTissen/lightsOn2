declare module '*.png' {
    const value: string;
    export default value;
}
declare module '*.frag' {
    const value: string;
    export default value;
}
declare module '*.json' {
    const value: {
		urls: string[];
		sprite: {
			[key: string]: number[];
		};
	};
    export default value;
}
