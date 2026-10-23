"""Encode the repo-launch capture; requires ffmpeg and ffprobe."""
import json
import os
import subprocess
from pathlib import Path

raw_dir = Path(os.environ.get("LAUNCH_RAW_VIDEO", "/tmp/antidoping-launch-video"))
raw = (raw_dir / "recorded-path.txt").read_text().strip()
output = Path(os.environ.get("LAUNCH_OUTPUT", "docs/launch"))


def run(arguments):
    subprocess.run(arguments, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


run(["ffmpeg", "-y", "-ss", "0.5", "-i", raw, "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p", "-r", "30", "-an", "-movflags", "+faststart", str(output / "demo.mp4")])
run(["ffmpeg", "-y", "-i", str(output / "demo.mp4"), "-vf", "fps=12,scale=760:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle", str(output / "demo.gif")])
run(["ffmpeg", "-y", "-ss", "7", "-i", str(output / "demo.mp4"), "-t", "12", "-c:v", "libx264", "-crf", "24", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", str(output / "teaser.mp4")])
metadata = {}
for name in ["demo.mp4", "demo.gif", "teaser.mp4", "social-preview.png"]:
    path = output / name
    probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height", "-of", "json", str(path)], text=True))
    metadata[name] = {"bytes": path.stat().st_size, **probe}
assert (output / "demo.gif").stat().st_size < 6_000_000
assert float(metadata["demo.mp4"]["format"]["duration"]) < 45
(output / "media-info.json").write_text(json.dumps(metadata, indent=2) + "\n")
print(json.dumps(metadata, indent=2))
