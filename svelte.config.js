import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			directives: {
				'default-src': ['none'],
				'img-src': ['self' ],
				'script-src': ['self' ],
				// i can't work out how to get inline styles working properly
				// i'd rather avoid all unsafe things in here
				'style-src': ['self', 'unsafe-inline' ] 
			}
		}
	},
	preprocess: vitePreprocess()
};

export default config;
