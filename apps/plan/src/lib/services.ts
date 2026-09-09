export const SERVICE_IDS = [
	"r2",
	"route53",
	"lambda",
	"app-runner",
	"rds",
	"cloud-run",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export const SERVICES: Record<
	ServiceId,
	{ label: string; color: string; mask?: boolean }
> = {
	"app-runner": { color: "#ed7100", label: "AWS App Runner" },
	"cloud-run": { color: "#4285f4", label: "Google Cloud Run" },
	lambda: { color: "#ed7100", label: "AWS Lambda" },
	r2: { color: "#f48120", label: "Cloudflare R2", mask: true },
	rds: { color: "#c925d1", label: "Amazon RDS" },
	route53: { color: "#8c4fff", label: "Amazon Route 53" },
};
