#!/home/rustwood/.openclaw/workspace/.venv-pocket/bin/python3
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import scipy.io.wavfile
from pocket_tts import TTSModel

WORKSPACE = Path('/home/rustwood/.openclaw/workspace')
CONV = WORKSPACE / 'conversations'
VOICE_REF = WORKSPACE / 'pocket_bruce_cloned_16bit.wav'
MODEL_ID = 'b6369a24'
SAMPLE_RATE_HINT = 22050


def load_stories(path: Path) -> list[dict]:
    data = json.loads(path.read_text())
    if not isinstance(data, list):
        raise ValueError(f'Expected JSON array in {path}')
    return data


def story_slug(story: dict) -> str:
    if 'date' in story and 'slug' in story:
        return f"{story['date']}-{story['slug']}"
    if 'slug' in story:
        return story['slug']
    raise ValueError('Story missing slug')


def story_text(story: dict) -> str:
    text = (story.get('audio_script') or '').strip()
    if not text:
        raise ValueError(f"Story {story.get('slug', '<unknown>')} missing audio_script")
    return text


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: render_newsroom_audio_bruce.py <stories.json> [output_dir]')
        return 1

    stories_path = Path(sys.argv[1]).expanduser().resolve()
    output_dir = Path(sys.argv[2]).expanduser().resolve() if len(sys.argv) > 2 else (CONV / 'assets' / 'audio')
    output_dir.mkdir(parents=True, exist_ok=True)

    if not VOICE_REF.exists():
        raise FileNotFoundError(f'Voice reference missing: {VOICE_REF}')

    stories = load_stories(stories_path)
    print(f'Loaded {len(stories)} stories from {stories_path}')
    print(f'Loading Pocket TTS model {MODEL_ID}...')
    t0 = time.time()
    tts_model = TTSModel.load_model(MODEL_ID, temp=0.7)
    print(f'✓ Model loaded in {time.time() - t0:.1f}s')

    print(f'Loading Bruce voice reference: {VOICE_REF.name}')
    t1 = time.time()
    voice_state = tts_model.get_state_for_audio_prompt(str(VOICE_REF))
    print(f'✓ Voice state created in {time.time() - t1:.1f}s')

    for idx, story in enumerate(stories, start=1):
        slug = story_slug(story)
        text = story_text(story)
        script_path = output_dir / f'{slug}-script.txt'
        wav_path = output_dir / f'{slug}.wav'
        script_path.write_text(text + '\n')
        print(f'[{idx}/{len(stories)}] Generating {slug}.wav ({len(text.split())} words)')
        start = time.time()
        audio = tts_model.generate_audio(voice_state, text)
        scipy.io.wavfile.write(str(wav_path), tts_model.sample_rate or SAMPLE_RATE_HINT, audio.numpy())
        elapsed = time.time() - start
        duration = len(audio) / (tts_model.sample_rate or SAMPLE_RATE_HINT)
        print(f'  ✓ Saved {wav_path} ({duration:.1f}s in {elapsed:.1f}s)')

    print('Done.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
