/** biome-ignore-all lint/performance/noJsxPropsBind: File overlays delegate to Finder's callbacks. */
import { MacGetInfo } from "./file-info";
import { fileInfoGeneral } from "./file-info-model";
import { MacQuickLook } from "./quick-look";
import type { useFinder } from "./use-finder";

export function FinderOverlays({
	browser,
}: {
	browser: ReturnType<typeof useFinder>;
}) {
	const { fileActions, onRename, onInfoChange, fileProps } = browser;
	const info = fileActions.info.file;
	const preview =
		fileActions.quickLook.items.find(
			(file) => file.id === fileActions.quickLook.value
		) ?? fileActions.quickLook.items[0];
	return (
		<>
			<MacQuickLook
				{...fileActions.quickLook}
				onOpenFile={
					preview && fileActions.canRun("open", [preview.id])
						? (id) => {
								fileActions.quickLook.onOpenChange(false);
								fileActions.run("open", [id]);
							}
						: undefined
				}
			/>
			{info ? (
				<MacGetInfo
					file={{
						...info,
						general: info.general ?? [
							...fileInfoGeneral({ ...info, preview: undefined }),
							...(fileActions.info.path
								? [{ label: "Where", value: fileActions.info.path }]
								: []),
						],
						preview: info.preview?.src
							? { alt: info.preview.alt, src: info.preview.src }
							: undefined,
					}}
					key={info.id}
					onInfoChange={onInfoChange}
					onOpenChange={fileActions.info.onOpenChange}
					onRename={onRename}
					open={fileActions.info.open}
					returnFocus={fileActions.info.returnFocus}
					validateRename={fileProps.validateRename}
				/>
			) : null}
		</>
	);
}
