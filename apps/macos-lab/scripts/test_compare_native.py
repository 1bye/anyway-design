"""Run: python3 -m unittest discover -s apps/macos-lab/scripts -p 'test_*.py'."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image

spec = importlib.util.spec_from_file_location("compare_native", Path(__file__).with_name("compare-native.py"))
comparison = importlib.util.module_from_spec(spec)
spec.loader.exec_module(comparison)


class NativeComparisonTests(unittest.TestCase):
    def test_identical_pixels_have_zero_error(self):
        image = Image.new("RGB", (2, 2), "white")
        _, result = comparison.compare(image, image)
        self.assertEqual(result["mean_absolute_channel_error"], 0)
        self.assertEqual(result["pixels_over_threshold"], 0)

    def test_threshold_counts_pixels_in_any_channel(self):
        live = Image.new("RGB", (2, 1))
        native = live.copy()
        native.putpixel((0, 0), (17, 0, 0))
        native.putpixel((1, 0), (16, 16, 16))
        _, result = comparison.compare(live, native, 16)
        self.assertEqual(result["pixels_over_threshold"], 1)
        self.assertEqual(result["fraction_over_threshold"], 0.5)

    def test_retina_crop_uses_position_and_density(self):
        image = Image.new("RGB", (20, 20))
        image.putpixel((5, 7), (1, 2, 3))
        crop = comparison.crop_scene(image, {"x": 2.5, "y": 3.5, "width": 2, "height": 3}, 2)
        self.assertEqual(crop.size, (4, 6))
        self.assertEqual(crop.getpixel((0, 0)), (1, 2, 3))

    def test_clipped_and_unequal_scenes_are_rejected(self):
        image = Image.new("RGB", (4, 4))
        with self.assertRaises(ValueError):
            comparison.crop_scene(image, {"x": -1, "y": 0, "width": 2, "height": 2}, 1)
        with self.assertRaises(ValueError):
            comparison.compare(image, Image.new("RGB", (2, 2)))

    def test_capture_round_trip_keeps_density_and_source(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            Image.new("RGB", (8, 4), "white").save(root / "capture.png")
            rects = [{"x": x, "y": 0, "width": 2, "height": 2} for x in (0, 2)]
            manifest = {
                "url": "http://localhost/example",
                "dpr": 2,
                "viewport": {"width": 4, "height": 2},
                "scenes": [{"rect": r, "visibleRect": r, "scale": 1} for r in rects],
            }
            path = root / "capture.json"
            path.write_text(json.dumps(manifest))
            result = comparison.run(path, root / "output", 16)
            self.assertEqual(result["source"], manifest["url"])
            self.assertEqual(result["pixels_over_threshold"], 0)
            with Image.open(root / "output/overlay.png") as overlay:
                self.assertEqual(overlay.size, (4, 4))
            manifest["scenes"][0]["visibleRect"] = {**rects[0], "width": 1}
            path.write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, "scroll container"):
                comparison.run(path, root / "clipped", 16)
            manifest["scenes"][0]["scale"] = 0.5
            path.write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, "1×"):
                comparison.run(path, root / "scaled", 16)
