import start from "@tanstack/react-start/server-entry";
import { type Bindings, handleApi } from "./server/api";

export default {
	async fetch(request: Request, env: Bindings) {
		const response = new URL(request.url).pathname.startsWith("/api/")
			? await handleApi(request, env)
			: await start.fetch(request);
		const secured = new Response(response.body, response);
		secured.headers.set("Referrer-Policy", "no-referrer");
		secured.headers.set("X-Content-Type-Options", "nosniff");
		secured.headers.set("X-Frame-Options", "DENY");
		return secured;
	},
};
