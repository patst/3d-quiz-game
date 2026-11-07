"""
Speaks sentences with the game's Qwen3-TTS voice and transcribes each clip (ADR-0015).
Called by scripts/generate-audio.ts; not meant to be run by hand.

stdin:  JSON lines {"id": ..., "say": ..., "attempt": n}
stdout: JSON lines {"id": ..., "heard": ...}  (one per input, in order of completion)
argv:   voice.json path, output directory for WAV files

Runs on an AMD GPU with PyTorch for ROCm (it reports itself as "cuda"), an NVIDIA GPU, or the
CPU (slow). See docs/audio.md.
"""
import json
import os
import sys

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
from transformers import pipeline

voice_path, out_dir = sys.argv[1], sys.argv[2]
voice = json.load(open(voice_path, encoding="utf-8"))
voice_dir = os.path.dirname(os.path.abspath(voice_path))
items = [json.loads(line) for line in sys.stdin if line.strip()]

gpu = torch.cuda.is_available()
device = "cuda:0" if gpu else "cpu"
dtype = torch.bfloat16 if gpu else torch.float32
batch_size = int(os.environ.get("QWEN_BATCH", "8" if gpu else "1"))
log = lambda *a: print(*a, file=sys.stderr, flush=True)  # noqa: E731
log(f"qwen_batch: {len(items)} sentences on {torch.cuda.get_device_name(0) if gpu else 'CPU'}, batch {batch_size}")

tts = Qwen3TTSModel.from_pretrained(voice["model"], device_map=device, dtype=dtype)
prompt = tts.create_voice_clone_prompt(
    ref_audio=os.path.join(voice_dir, voice["refAudio"]), ref_text=voice["refText"]
)
asr = pipeline(
    "automatic-speech-recognition",
    model=os.environ.get("ASR_MODEL", "openai/whisper-large-v3-turbo" if gpu else "openai/whisper-small"),
    device=device,
    dtype=torch.float16 if gpu else torch.float32,
)

done = 0
for start in range(0, len(items), batch_size):
    batch = items[start : start + batch_size]
    # Same sentence + same attempt → same seed, so a rerun reproduces a clip; a retry differs.
    torch.manual_seed(voice.get("seed", 1) + 1000 * batch[0]["attempt"] + start)
    wavs, sr = tts.generate_voice_clone(
        text=[it["say"] for it in batch],
        language=["German"] * len(batch),
        voice_clone_prompt=prompt * len(batch),
        **voice.get("generate", {}),
    )
    for it, wav in zip(batch, wavs):
        path = os.path.join(out_dir, f"{it['id']}.wav")
        sf.write(path, wav, sr)
        heard = asr(
            {"raw": wav.astype("float32"), "sampling_rate": sr},
            generate_kwargs={"language": "german", "task": "transcribe"},
        )["text"]
        print(json.dumps({"id": it["id"], "heard": heard.strip()}, ensure_ascii=False), flush=True)
    done += len(batch)
    log(f"  {done}/{len(items)}")
