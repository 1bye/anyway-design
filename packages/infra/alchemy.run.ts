import { Stack } from "alchemy";
import { D1, providers, state, Website } from "alchemy/Cloudflare";
import { config } from "dotenv";
import { string, withDefault } from "effect/Config";
import { gen } from "effect/Effect";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/md/.env" });

export default Stack(
	"anyway-design",
	{
		providers: providers(),
		state: state(),
	},
	gen(function* () {
		const webWorker = yield* Website.Vite("web", {
			compatibility: {
				flags: ["nodejs_compat"],
			},
			dev: {
				port: 3001,
			},
			env: {
				VITE_SERVER_URL: string("VITE_SERVER_URL"),
			},
			rootDir: "../../apps/web",
		});

		const presets = yield* D1.Database("md-presets", {
			migrationsDir: "../../apps/md/migrations",
		});
		const mdWorker = yield* Website.Vite("md", {
			compatibility: { flags: ["nodejs_compat"] },
			dev: { port: 3003 },
			domain: process.env.MD_DOMAIN || undefined,
			env: {
				APP_ENV: "production",
				DB: presets,
				TURNSTILE_SECRET_KEY: string("MD_TURNSTILE_SECRET_KEY").pipe(
					withDefault("")
				),
				TURNSTILE_SITE_KEY: string("MD_TURNSTILE_SITE_KEY").pipe(
					withDefault("")
				),
			},
			main: "src/worker.ts",
			memo: { workspaces: [{ cwd: "../../packages/md-cli" }] },
			rootDir: "../../apps/md",
		});

		return {
			md: mdWorker.url,
			web: webWorker.url,
		};
	})
);
