import { z } from "zod";
import {
	conflicts,
	generateMarkdown,
	presetSchema,
	SKILL_DIRECTORIES,
	SKILLS,
} from "../lib/preset";

export interface Bindings {
	APP_ENV: string;
	DB: D1Database;
	TURNSTILE_SECRET_KEY?: string;
	TURNSTILE_SITE_KEY?: string;
}

interface Library {
	id: string;
}
interface PresetRow {
	id: string;
	manifest: string;
	updated_at: number;
}
const MAX_BODY_BYTES = 1_048_576;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const ID_PATTERN = /^[a-f0-9]{32}$/;
const JSON_HEADERS = {
	"cache-control": "no-store",
	"content-type": "application/json; charset=utf-8",
	"x-content-type-options": "nosniff",
};

class ApiError extends Error {
	status: number;
	constructor(status: number, message: string, options?: ErrorOptions) {
		super(message, options);
		this.status = status;
	}
}

const json = (
	value: unknown,
	status = 200,
	headers: Record<string, string> = {}
) =>
	new Response(JSON.stringify(value), {
		headers: { ...JSON_HEADERS, ...headers },
		status,
	});

const randomToken = (bytes = 32) =>
	Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) =>
		byte.toString(16).padStart(2, "0")
	).join("");

async function digest(value: string) {
	const hash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value)
	);
	return Array.from(new Uint8Array(hash), (byte) =>
		byte.toString(16).padStart(2, "0")
	).join("");
}

function isLocal(request: Request, env: Bindings) {
	const { hostname } = new URL(request.url);
	return (
		env.APP_ENV === "development" &&
		(hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname.endsWith(".localhost"))
	);
}

const cookieName = (request: Request, env: Bindings) =>
	isLocal(request, env) ? "md_local_session" : "__Host-md_session";
function sessionCookie(request: Request, env: Bindings, token: string) {
	return `${cookieName(request, env)}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${isLocal(request, env) ? "" : "; Secure"}`;
}

async function library(
	request: Request,
	env: Bindings
): Promise<Library | null> {
	const prefix = `${cookieName(request, env)}=`;
	const token = request.headers
		.get("cookie")
		?.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(prefix))
		?.slice(prefix.length);
	if (!(token && TOKEN_PATTERN.test(token))) {
		return null;
	}
	return await env.DB.prepare("SELECT id FROM libraries WHERE session_hash = ?")
		.bind(await digest(token))
		.first<Library>();
}

async function requireLibrary(request: Request, env: Bindings) {
	const owner = await library(request, env);
	if (!owner) {
		throw new ApiError(
			401,
			"Restore your library or create a new one to save this setup."
		);
	}
	return owner;
}

async function readJson(request: Request): Promise<unknown> {
	if (!request.headers.get("content-type")?.startsWith("application/json")) {
		throw new ApiError(415, "Send JSON data.");
	}
	if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
		throw new ApiError(413, "This request exceeds 1 MB.");
	}
	const reader = request.body?.getReader();
	if (!reader) {
		throw new ApiError(400, "Request body is missing.");
	}
	const decoder = new TextDecoder();
	let length = 0;
	let body = "";
	try {
		for (;;) {
			// biome-ignore lint/performance/noAwaitInLoops: Read sequential chunks so oversized requests stop before buffering the full body.
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			length += value.byteLength;
			if (length > MAX_BODY_BYTES) {
				await reader.cancel();
				throw new ApiError(413, "This request exceeds 1 MB.");
			}
			body += decoder.decode(value, { stream: true });
		}
		body += decoder.decode();
	} finally {
		reader.releaseLock();
	}
	try {
		return JSON.parse(body);
	} catch (cause) {
		// biome-ignore lint/style/useErrorCause: ApiError forwards its third argument to ErrorOptions.
		throw new ApiError(400, "This is not valid JSON.", { cause });
	}
}

async function rateLimit(
	env: Bindings,
	key: string,
	limit: number,
	seconds: number
) {
	const now = Math.floor(Date.now() / 1000);
	const row =
		await env.DB.prepare(`INSERT INTO rate_limits (key, expires_at, hits) VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET
      hits = CASE WHEN expires_at <= ? THEN 1 ELSE hits + 1 END,
      expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
    RETURNING hits`)
			.bind(key, now + seconds, now, now)
			.first<{ hits: number }>();
	if (!row || row.hits > limit) {
		throw new ApiError(429, "A few too many requests. Please try again later.");
	}
}

async function protectWrite(request: Request, env: Bindings) {
	// Require the exact origin even on sibling subdomains; SameSite alone is insufficient.
	if (request.headers.get("origin") !== new URL(request.url).origin) {
		throw new ApiError(403, "This request must come from the builder.");
	}
	const ip = isLocal(request, env)
		? "local"
		: request.headers.get("cf-connecting-ip");
	if (!ip) {
		throw new ApiError(403, "Unable to verify the request origin.");
	}
	const ipHash = await digest(ip);
	await rateLimit(env, `write:${ipHash}`, 120, 3600);
	await env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?")
		.bind(Math.floor(Date.now() / 1000) - 3600)
		.run();
	return ipHash;
}

async function verifyHuman(request: Request, env: Bindings, token?: string) {
	if (isLocal(request, env)) {
		return;
	}
	if (!(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY)) {
		throw new ApiError(
			503,
			"Cloud saves are not configured on this deployment yet. You can still export your setup."
		);
	}
	if (!token) {
		throw new ApiError(400, "Complete the verification before saving.");
	}
	const result = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
			body: new URLSearchParams({
				remoteip: request.headers.get("cf-connecting-ip") ?? "",
				response: token,
				secret: env.TURNSTILE_SECRET_KEY,
			}),
			method: "POST",
			signal: AbortSignal.timeout(10_000),
		}
	);
	const verification = (await result.json()) as {
		success: boolean;
		hostname?: string;
	};
	if (
		!(result.ok && verification.success) ||
		verification.hostname !== new URL(request.url).hostname
	) {
		throw new ApiError(
			403,
			"Verification expired or failed. Please try again."
		);
	}
}

async function createLibrary(request: Request, env: Bindings, ipHash: string) {
	const current = await library(request, env);
	if (current) {
		return json({ ready: true });
	}
	await rateLimit(env, `create:${ipHash}`, 5, 3600);
	const body = z
		.object({ turnstileToken: z.string().max(2048).optional() })
		.parse(await readJson(request));
	await verifyHuman(request, env, body.turnstileToken);
	await rateLimit(env, "create:global", 1000, 86_400);
	const token = randomToken();
	const recoveryKey = randomToken();
	await env.DB.prepare(
		"INSERT INTO libraries (id, session_hash, recovery_hash, created_at) VALUES (?, ?, ?, ?)"
	)
		.bind(
			randomToken(16),
			await digest(token),
			await digest(recoveryKey),
			Date.now()
		)
		.run();
	return json({ ready: true, recoveryKey }, 201, {
		"set-cookie": sessionCookie(request, env, token),
	});
}

async function recover(request: Request, env: Bindings, ipHash: string) {
	await rateLimit(env, `recover:${ipHash}`, 5, 3600);
	const { key } = z
		.object({ key: z.string().regex(TOKEN_PATTERN) })
		.parse(await readJson(request));
	const owner = await env.DB.prepare(
		"SELECT id FROM libraries WHERE recovery_hash = ?"
	)
		.bind(await digest(key))
		.first<Library>();
	if (!owner) {
		throw new ApiError(
			404,
			"That recovery key was not found. Check it and try again."
		);
	}
	const token = randomToken();
	await env.DB.prepare("UPDATE libraries SET session_hash = ? WHERE id = ?")
		.bind(await digest(token), owner.id)
		.run();
	return json({ ready: true }, 200, {
		"set-cookie": sessionCookie(request, env, token),
	});
}

async function listPresets(request: Request, env: Bindings) {
	const owner = await library(request, env);
	if (!owner) {
		return json({ bytes: 0, presets: [], ready: false });
	}
	const result = await env.DB.prepare(
		"SELECT id, manifest, updated_at FROM presets WHERE owner_id = ? ORDER BY updated_at DESC"
	)
		.bind(owner.id)
		.all<PresetRow>();
	return json({
		presets: result.results.map((row) => ({
			id: row.id,
			preset: presetSchema.parse(JSON.parse(row.manifest)),
			updatedAt: row.updated_at,
		})),
		ready: true,
	});
}

async function savePreset(request: Request, env: Bindings, id?: string) {
	const owner = await requireLibrary(request, env);
	await rateLimit(env, `owner:${owner.id}`, 120, 3600);
	const preset = presetSchema.parse(await readJson(request));
	const problems = conflicts(preset);
	if (problems.length) {
		throw new ApiError(400, problems.join(" "));
	}
	const manifest = JSON.stringify({
		...preset,
		outputMarkdown: generateMarkdown(preset),
		resolvedSkills: SKILLS.filter((skill) => preset.skills.includes(skill.id)),
	});
	const bytes = new TextEncoder().encode(manifest).byteLength;
	const updatedAt = Date.now();
	const presetId = id ?? randomToken(16);
	try {
		if (id) {
			const result = await env.DB.prepare(
				"UPDATE presets SET name = ?, manifest = ?, bytes = ?, updated_at = ? WHERE id = ? AND owner_id = ?"
			)
				.bind(preset.name, manifest, bytes, updatedAt, id, owner.id)
				.run();
			if (!result.meta.changes) {
				throw new ApiError(404, "This setup is not in your library.");
			}
		} else {
			await env.DB.prepare(
				"INSERT INTO presets (id, owner_id, name, manifest, bytes, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
			)
				.bind(presetId, owner.id, preset.name, manifest, bytes, updatedAt)
				.run();
		}
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("preset_count_limit")
		) {
			// biome-ignore lint/style/useErrorCause: ApiError forwards its third argument to ErrorOptions.
			throw new ApiError(
				409,
				"Your library has five setups. Update one or delete a setup to make room.",
				{ cause: error }
			);
		}
		if (
			error instanceof Error &&
			error.message.includes("preset_storage_limit")
		) {
			// biome-ignore lint/style/useErrorCause: ApiError forwards its third argument to ErrorOptions.
			throw new ApiError(413, "Your library has reached its 1 MB limit.", {
				cause: error,
			});
		}
		throw error;
	}
	return json({ id: presetId, preset, updatedAt }, id ? 200 : 201);
}

async function publicPreset(env: Bindings, id: string) {
	const row = await env.DB.prepare(
		"SELECT id, manifest, updated_at FROM presets WHERE id = ?"
	)
		.bind(id)
		.first<PresetRow>();
	if (!row) {
		throw new ApiError(
			404,
			"This setup no longer exists, or the link is incorrect."
		);
	}
	const stored = JSON.parse(row.manifest) as {
		resolvedSkills: typeof SKILLS;
		outputMarkdown: string;
	};
	const preset = presetSchema.parse(stored);
	return json({
		id: row.id,
		markdown: stored.outputMarkdown,
		preset,
		skillDirectory: SKILL_DIRECTORIES[preset.target],
		skills: stored.resolvedSkills,
		updatedAt: row.updated_at,
	});
}

async function readEndpoint(request: Request, env: Bindings, path: string) {
	if (path === "/api/config") {
		return json({
			challengeRequired: !isLocal(request, env),
			savesAvailable:
				isLocal(request, env) ||
				Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY),
			siteKey: env.TURNSTILE_SITE_KEY ?? null,
		});
	}
	if (path === "/api/library") {
		return await listPresets(request, env);
	}
	if (path.startsWith("/api/presets/")) {
		const id = path.slice("/api/presets/".length);
		if (!ID_PATTERN.test(id)) {
			throw new ApiError(404, "Setup not found.");
		}
		return await publicPreset(env, id);
	}
	if (path.startsWith("/api/skills/")) {
		const skill = SKILLS.find(
			(item) => item.id === path.slice("/api/skills/".length)
		);
		if (!skill) {
			throw new ApiError(404, "Skill not found.");
		}
		const source = await fetch(
			`https://raw.githubusercontent.com/${skill.repo}/${skill.revision}/${skill.path}/SKILL.md`,
			{ signal: AbortSignal.timeout(10_000) }
		);
		if (!source.ok) {
			throw new ApiError(
				502,
				"The upstream skill could not be loaded. Its source link is still available."
			);
		}
		return json({ markdown: await source.text() });
	}
	throw new ApiError(404, "Endpoint not found.");
}

async function writeEndpoint(request: Request, env: Bindings, path: string) {
	const ipHash = await protectWrite(request, env);
	if (path === "/api/library" && request.method === "POST") {
		return await createLibrary(request, env, ipHash);
	}
	if (path === "/api/recover" && request.method === "POST") {
		return await recover(request, env, ipHash);
	}
	if (path === "/api/recovery" && request.method === "POST") {
		const owner = await requireLibrary(request, env);
		const recoveryKey = randomToken();
		await env.DB.prepare("UPDATE libraries SET recovery_hash = ? WHERE id = ?")
			.bind(await digest(recoveryKey), owner.id)
			.run();
		return json({ recoveryKey });
	}
	if (path === "/api/presets" && request.method === "POST") {
		return await savePreset(request, env);
	}
	const id = path.startsWith("/api/presets/")
		? path.slice("/api/presets/".length)
		: "";
	if (ID_PATTERN.test(id)) {
		if (request.method === "PUT") {
			return await savePreset(request, env, id);
		}
		if (request.method === "DELETE") {
			const owner = await requireLibrary(request, env);
			const result = await env.DB.prepare(
				"DELETE FROM presets WHERE id = ? AND owner_id = ?"
			)
				.bind(id, owner.id)
				.run();
			if (!result.meta.changes) {
				throw new ApiError(404, "This setup is not in your library.");
			}
			return json({ deleted: true });
		}
	}
	throw new ApiError(405, "This action is not supported.");
}

export async function handleApi(request: Request, env: Bindings) {
	try {
		const path = new URL(request.url).pathname;
		if (request.method === "GET") {
			return await readEndpoint(request, env, path);
		}
		return await writeEndpoint(request, env, path);
	} catch (error) {
		if (error instanceof ApiError) {
			return json(
				{ error: error.message },
				error.status,
				error.status === 429 ? { "retry-after": "3600" } : {}
			);
		}
		if (error instanceof z.ZodError) {
			return json({ error: error.issues[0]?.message ?? "Invalid setup." }, 400);
		}
		return json(
			{
				error:
					"The service could not complete this request. Your draft is still here; please try again.",
			},
			503
		);
	}
}
