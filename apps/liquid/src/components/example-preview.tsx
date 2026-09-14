import { Tabs } from "@base-ui/react/tabs";
import { Check, Copy } from "lucide-react";
import {
	lazy,
	type ReactNode,
	Suspense,
	useCallback,
	useEffect,
	useState,
} from "react";

const HighlightedCode = lazy(() => import("./highlighted-code"));

export function ExamplePreview({
	children,
	code,
	name,
	heading,
	controls,
	variants,
}: {
	children: ReactNode;
	code: string;
	name: string;
	heading: ReactNode;
	controls: ReactNode;
	variants: ReactNode;
}) {
	const [tab, setTab] = useState<string | number | null>("preview");
	const [copiedCode, setCopiedCode] = useState("");
	const [failed, setFailed] = useState(false);
	const copied = copiedCode === code;
	const changeTab = useCallback((value: string | number | null) => {
		setTab(value);
		setCopiedCode("");
		setFailed(false);
	}, []);
	useEffect(() => {
		if (!copiedCode) {
			return;
		}
		const timer = setTimeout(() => setCopiedCode(""), 1600);
		return () => clearTimeout(timer);
	}, [copiedCode]);
	const copyCode = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopiedCode(code);
			setFailed(false);
		} catch {
			setFailed(true);
		}
	}, [code]);
	return (
		<Tabs.Root
			className="example-preview"
			onValueChange={changeTab}
			value={tab}
		>
			<div className="playground-main">
				{heading}
				<div className="playground-frame">
					<div className="example-toolbar">
						<div className="playground-view-controls">
							<Tabs.List aria-label={`${name} view`} className="example-tabs">
								<Tabs.Tab value="preview">Preview</Tabs.Tab>
								<Tabs.Tab value="code">Code</Tabs.Tab>
							</Tabs.List>
						</div>
						<div className="playground-toolbar-actions">
							{variants}
							{tab === "code" && (
								<button
									aria-label={`Copy ${name} code`}
									className="copy-code"
									onClick={copyCode}
									type="button"
								>
									{copied ? (
										<Check aria-hidden="true" size={14} />
									) : (
										<Copy aria-hidden="true" size={14} />
									)}
									{copied ? "Copied" : "Copy"}
								</button>
							)}
						</div>
					</div>
					<Tabs.Panel keepMounted value="preview">
						{children}
					</Tabs.Panel>
					<Tabs.Panel className="example-code-panel" value="code">
						<pre>
							<Suspense fallback={<code>{code}</code>}>
								<HighlightedCode code={code} />
							</Suspense>
						</pre>
						{failed ? (
							<p className="copy-error" role="alert">
								Couldn’t copy. Select the code to copy it manually.
							</p>
						) : null}
					</Tabs.Panel>
				</div>
			</div>
			<aside
				aria-label={`${name} playground controls`}
				className="playground-sidebar"
				hidden={!controls}
			>
				{controls}
			</aside>
			<span className="copy-announcement" role="status">
				{copied ? "Code copied to clipboard." : ""}
			</span>
		</Tabs.Root>
	);
}
