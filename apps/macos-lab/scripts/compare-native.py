"""Compare two equally scaled regions from a CUA browser capture.

Usage: python3 apps/macos-lab/scripts/compare-native.py capture.json --output /tmp/diff
The JSON records dpr, viewport, and two scene rects from getBoundingClientRect().
The adjacent PNG must be a full-viewport capture at that DPR. No registration,
resizing, or background removal is performed: those can conceal geometry bugs.
Requires Pillow. All outputs are diagnostics, never component artwork.
"""

import argparse
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageStat


def crop_scene(image, rect, dpr):
    if dpr <= 0 or rect["width"] <= 0 or rect["height"] <= 0:
        raise ValueError("DPR and scene dimensions must be positive")
    left = round(rect["x"] * dpr)
    top = round(rect["y"] * dpr)
    right = left + round(rect["width"] * dpr)
    bottom = top + round(rect["height"] * dpr)
    if left < 0 or top < 0 or right > image.width or bottom > image.height:
        raise ValueError("Scene is clipped; capture the whole scene before comparing")
    return image.crop((left, top, right, bottom)).convert("RGB")


def compare(live, native, threshold=16):
    if live.size != native.size:
        raise ValueError(f"Unequal pixel sizes: {live.size} versus {native.size}")
    if not 0 <= threshold <= 255:
        raise ValueError("Threshold must be between 0 and 255")
    difference = ImageChops.difference(live, native)
    channels = difference.split()
    maximum = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
    histogram = maximum.histogram()
    changed = sum(histogram[threshold + 1 :])
    return difference, {
        "width": live.width,
        "height": live.height,
        "mean_absolute_channel_error": round(sum(ImageStat.Stat(difference).mean) / 3, 4),
        "threshold": threshold,
        "pixels_over_threshold": changed,
        "fraction_over_threshold": round(changed / (live.width * live.height), 6),
        "note": "Diagnostic only; background area, fonts, JPEG noise, and animation phase affect these metrics. This is not a native-fidelity score.",
    }


def run(manifest_path, output, threshold):
    manifest = json.loads(manifest_path.read_text())
    if len(manifest["scenes"]) != 2:
        raise ValueError("Expected exactly two scenes: live, then native")
    with Image.open(manifest_path.with_suffix(".png")) as source:
        image = source.copy()
    dpr = manifest["dpr"]
    expected = tuple(round(manifest["viewport"][axis] * dpr) for axis in ("width", "height"))
    if image.size != expected:
        raise ValueError(f"Capture size {image.size} does not match viewport × DPR {expected}")
    for scene in manifest["scenes"]:
        if scene.get("scale") != 1:
            raise ValueError("Capture each scene at 1× logical scale")
        if any(not image.get("complete") or not image.get("width") for image in scene.get("images", [])):
            raise ValueError("A comparison image is missing or has not finished loading")
        rect = scene["rect"]
        visible = scene.get("visibleRect")
        if visible is None or any(abs(rect[key] - visible[key]) * dpr > 1 for key in ("x", "y", "width", "height")):
            raise ValueError("Scene is clipped by a scroll container; choose a visible detail or viewport region")
    live, native = [crop_scene(image, scene["rect"], dpr) for scene in manifest["scenes"]]
    difference, metrics = compare(live, native, threshold)
    output.mkdir(parents=True, exist_ok=True)
    live.save(output / "live.png")
    native.save(output / "native.png")
    Image.blend(live, native, 0.5).save(output / "overlay.png")
    ImageEnhance.Brightness(difference).enhance(4).save(output / "difference-4x.png")
    pair = Image.new("RGB", (live.width * 2, live.height), "white")
    pair.paste(live, (0, 0))
    pair.paste(native, (live.width, 0))
    pair.save(output / "side-by-side.png")
    metrics.update({"source": manifest.get("url"), "dpr": dpr, "reference": manifest["scenes"][1].get("images", [])})
    (output / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--threshold", type=int, default=16)
    args = parser.parse_args()
    print(json.dumps(run(args.manifest, args.output, args.threshold), indent=2))
