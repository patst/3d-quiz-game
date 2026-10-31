"""Synthesise many sentences with one Piper voice load.

Reads JSON lines {"id": ..., "text": ...} from stdin and writes <out_dir>/<id>.wav.
Usage: python piper_batch.py <model.onnx> <out_dir> <length_scale>
"""
import json
import sys
import wave
from pathlib import Path

from piper import PiperVoice, SynthesisConfig

model, out_dir, length_scale = sys.argv[1], Path(sys.argv[2]), float(sys.argv[3])
config = SynthesisConfig(length_scale=length_scale)
out_dir.mkdir(parents=True, exist_ok=True)
voice = PiperVoice.load(model)
for line in sys.stdin:
    item = json.loads(line)
    with wave.open(str(out_dir / f"{item['id']}.wav"), "wb") as wav:
        voice.synthesize_wav(item["text"], wav, syn_config=config)
    print(item["id"], flush=True)
