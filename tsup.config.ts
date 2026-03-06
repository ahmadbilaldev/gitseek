import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: false,
	clean: true,
	minify: false,
	shims: true,
	banner: {js: '#!/usr/bin/env node'},
	splitting: false,
	sourcemap: false,
	keepNames: true,
	treeshake: false,
	bundle: true,
	platform: 'node',
	target: 'node18',
	outDir: 'dist',
	outExtension: () => ({js: '.mjs'}),
});
