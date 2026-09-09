import { Database } from "bun:sqlite";
import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { readFileSync } from "node:fs";
import { DEFAULT_PRESET } from "../src/lib/preset";
import { type Bindings, handleApi } from "../src/server/api";

let database: Database;
let env: Bindings;
const PINNED_REVISION = /^[a-f0-9]{40}$/;
const origin = "http://localhost:3002";
const migration = readFileSync(
	new URL("../migrations/0001_presets.sql", import.meta.url),
	"utf8"
);

beforeEach(() => {
	database = new Database(":memory:");
	database.exec(migration);
	// Execute the production queries and constraints in real SQLite; only adapt D1's interface.
	const adapter = {
		prepare(sql: string) {
			const statement = (values: (string | number)[] = []) => ({
				all: () => ({ results: database.query(sql).all(...values) }),
				bind: (...args: (string | number)[]) => statement(args),
				first: () => database.query(sql).get(...values),
				run: () => ({
					meta: { changes: database.query(sql).run(...values).changes },
				}),
			});
			return statement();
		},
	};
	env = { APP_ENV: "development", DB: adapter as unknown as D1Database };
});
afterEach(() => database.close());

const request = (path: string, method = "GET", body?: unknown, cookie = "") =>
	handleApi(
		new Request(`${origin}${path}`, {
			body: body === undefined ? undefined : JSON.stringify(body),
			headers: { "content-type": "application/json", cookie, origin },
			method,
		}),
		env
	);

async function create() {
	const response = await request("/api/library", "POST", {});
	expect(response.status).toBe(201);
	const { recoveryKey } = (await response.json()) as { recoveryKey: string };
	const cookie = response.headers.get("set-cookie")?.split(";")[0] ?? "";
	expect(response.headers.get("set-cookie")).toContain(
		"HttpOnly; SameSite=Strict"
	);
	return { cookie, recoveryKey };
}

test("anonymous owner can save, list and update; sharing grants no editing access", async () => {
	const a = await create();
	const b = await create();
	const saved = await request("/api/presets", "POST", DEFAULT_PRESET, a.cookie);
	expect(saved.status).toBe(201);
	const { id } = (await saved.json()) as { id: string };
	const shared = await request(`/api/presets/${id}`);
	const payload = await shared.json();
	expect(shared.headers.get("cache-control")).toBe("no-store");
	expect(payload.markdown).toContain("# AGENTS.md");
	expect(payload.skills).toHaveLength(DEFAULT_PRESET.skills.length);
	expect(payload.skills[0].revision).toMatch(PINNED_REVISION);
	expect(JSON.stringify(payload)).not.toContain("recoveryKey");
	expect(
		(await request(`/api/presets/${id}`, "PUT", DEFAULT_PRESET, b.cookie))
			.status
	).toBe(404);
	expect(
		(await request(`/api/presets/${id}`, "DELETE", undefined, b.cookie)).status
	).toBe(404);
	expect(
		(await request(`/api/presets/${id}`, "PUT", DEFAULT_PRESET)).status
	).toBe(401);
	const updated = await request(
		`/api/presets/${id}`,
		"PUT",
		{ ...DEFAULT_PRESET, name: "Updated" },
		a.cookie
	);
	expect(updated.status).toBe(200);
	const list = await (
		await request("/api/library", "GET", undefined, a.cookie)
	).json();
	expect(list.presets[0].preset.name).toBe("Updated");
	expect(list.presets[0].preset.resolvedSkills).toBeUndefined();
	expect(
		(await request(`/api/presets/${id}`, "DELETE", undefined, a.cookie)).status
	).toBe(200);
	expect((await request(`/api/presets/${id}`)).status).toBe(404);
});

test("public installs read the saved snapshot, including pinned revisions", async () => {
	const { cookie } = await create();
	const { id } = await (
		await request("/api/presets", "POST", DEFAULT_PRESET, cookie)
	).json();
	const row = database
		.query("SELECT manifest FROM presets WHERE id = ?")
		.get(id) as { manifest: string };
	const stored = JSON.parse(row.manifest);
	stored.resolvedSkills[0].revision = "a".repeat(40);
	stored.outputMarkdown = "# Stored instructions\n";
	database
		.query("UPDATE presets SET manifest = ? WHERE id = ?")
		.run(JSON.stringify(stored), id);
	const shared = await (await request(`/api/presets/${id}`)).json();
	expect(shared.markdown).toBe(stored.outputMarkdown);
	expect(shared.skills[0].revision).toBe("a".repeat(40));
});

test("recovery rotates browser access and recovery-key replacement invalidates the old key", async () => {
	const first = await create();
	const stored = database
		.query("SELECT session_hash, recovery_hash FROM libraries")
		.get() as { session_hash: string; recovery_hash: string };
	expect(stored.recovery_hash).not.toBe(first.recoveryKey);
	expect(first.cookie).not.toContain(stored.session_hash);
	const recovered = await request("/api/recover", "POST", {
		key: first.recoveryKey,
	});
	expect(recovered.status).toBe(200);
	const cookie = recovered.headers.get("set-cookie")?.split(";")[0] ?? "";
	expect(
		(
			await (
				await request("/api/library", "GET", undefined, first.cookie)
			).json()
		).ready
	).toBe(false);
	expect(
		(await (await request("/api/library", "GET", undefined, cookie)).json())
			.ready
	).toBe(true);
	const replacement = await (
		await request("/api/recovery", "POST", {}, cookie)
	).json();
	expect(
		(await request("/api/recover", "POST", { key: first.recoveryKey })).status
	).toBe(404);
	expect(
		(await request("/api/recover", "POST", { key: replacement.recoveryKey }))
			.status
	).toBe(200);
});

test("five-save quota survives parallel requests and permits updating a full library", async () => {
	const { cookie } = await create();
	const results = await Promise.all(
		Array.from({ length: 6 }, () =>
			request("/api/presets", "POST", DEFAULT_PRESET, cookie)
		)
	);
	expect(results.filter((response) => response.status === 201)).toHaveLength(5);
	expect(results.filter((response) => response.status === 409)).toHaveLength(1);
	const list = await (
		await request("/api/library", "GET", undefined, cookie)
	).json();
	expect(
		(
			await request(
				`/api/presets/${list.presets[0].id}`,
				"PUT",
				DEFAULT_PRESET,
				cookie
			)
		).status
	).toBe(200);
});

test("1 MB aggregate storage limit rejects inserts and updates without changing saved data", async () => {
	const { cookie } = await create();
	const large = { ...DEFAULT_PRESET, custom: "😀".repeat(40_000) };
	expect((await request("/api/presets", "POST", large, cookie)).status).toBe(
		201
	);
	expect((await request("/api/presets", "POST", large, cookie)).status).toBe(
		201
	);
	const { id } = await (
		await request("/api/presets", "POST", DEFAULT_PRESET, cookie)
	).json();
	const larger = { ...DEFAULT_PRESET, custom: "😀".repeat(50_000) };
	expect((await request("/api/presets", "POST", larger, cookie)).status).toBe(
		413
	);
	expect(
		(await request(`/api/presets/${id}`, "PUT", larger, cookie)).status
	).toBe(413);
	expect(
		(await (await request(`/api/presets/${id}`)).json()).preset.custom
	).toBe("");
});

test("malformed input, inconsistent rules, oversize bodies, and cross-origin writes are rejected", async () => {
	const { cookie } = await create();
	expect(
		(
			await request(
				"/api/presets",
				"POST",
				{ ...DEFAULT_PRESET, skills: ["unknown"] },
				cookie
			)
		).status
	).toBe(400);
	expect(
		(
			await request(
				"/api/presets",
				"POST",
				{ ...DEFAULT_PRESET, skills: ["obra-test-driven-development"] },
				cookie
			)
		).status
	).toBe(400);
	expect(
		(
			await request(
				"/api/presets",
				"POST",
				{ ...DEFAULT_PRESET, custom: "x".repeat(1_048_577) },
				cookie
			)
		).status
	).toBe(413);
	const malformed = await handleApi(
		new Request(`${origin}/api/presets`, {
			body: "{",
			headers: { "content-type": "application/json", cookie, origin },
			method: "POST",
		}),
		env
	);
	expect(malformed.status).toBe(400);
	const foreign = await handleApi(
		new Request(`${origin}/api/presets`, {
			body: JSON.stringify(DEFAULT_PRESET),
			headers: {
				"content-type": "application/json",
				cookie,
				origin: "http://evil.localhost:3002",
			},
			method: "POST",
		}),
		env
	);
	expect(foreign.status).toBe(403);
});

test("recovery guesses are rate limited", async () => {
	for (let attempt = 0; attempt < 5; attempt += 1) {
		expect(
			// biome-ignore lint/performance/noAwaitInLoops: Exercise the rate limit in request order.
			(await request("/api/recover", "POST", { key: "a".repeat(64) })).status
		).toBe(404);
	}
	const limited = await request("/api/recover", "POST", {
		key: "a".repeat(64),
	});
	expect(limited.status).toBe(429);
	expect(limited.headers.get("retry-after")).toBeTruthy();
});

test("development configuration cannot bypass human verification on a public hostname", async () => {
	const host = "https://md.anyway.design";
	const config = await handleApi(new Request(`${host}/api/config`), env);
	expect((await config.json()).savesAvailable).toBe(false);
	const response = await handleApi(
		new Request(`${host}/api/library`, {
			body: "{}",
			headers: {
				"cf-connecting-ip": "192.0.2.1",
				"content-type": "application/json",
				origin: host,
			},
			method: "POST",
		}),
		env
	);
	expect(response.status).toBe(503);
	expect(response.headers.get("set-cookie")).toBeNull();
});

test("public saves verify Turnstile's hostname and issue a host-only secure cookie", async () => {
	const host = "https://md.anyway.design";
	env.APP_ENV = "production";
	env.TURNSTILE_SITE_KEY = "test-site-key";
	env.TURNSTILE_SECRET_KEY = "test-secret";
	const verify = spyOn(globalThis, "fetch");
	const createRequest = () =>
		new Request(`${host}/api/library`, {
			body: JSON.stringify({ turnstileToken: "test-token" }),
			headers: {
				"cf-connecting-ip": "192.0.2.1",
				"content-type": "application/json",
				origin: host,
			},
			method: "POST",
		});
	try {
		verify.mockResolvedValueOnce(
			Response.json({ hostname: "unrelated.example", success: true })
		);
		expect((await handleApi(createRequest(), env)).status).toBe(403);
		verify.mockResolvedValueOnce(
			Response.json({ hostname: "md.anyway.design", success: true })
		);
		const response = await handleApi(createRequest(), env);
		expect(response.status).toBe(201);
		expect(response.headers.get("set-cookie")).toStartWith(
			"__Host-md_session="
		);
		expect(response.headers.get("set-cookie")).toContain("; Secure");
		expect(response.headers.get("set-cookie")).not.toContain("Domain=");
		const config = await (
			await handleApi(new Request(`${host}/api/config`), env)
		).json();
		expect(config.savesAvailable).toBe(true);
		expect(JSON.stringify(config)).not.toContain("test-secret");
	} finally {
		verify.mockRestore();
	}
});
