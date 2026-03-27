#!/home/rustwood/.openclaw/workspace/.venv-pocket/bin/python3
from pathlib import Path
import numpy as np
import scipy.io.wavfile as wavfile
from pocket_tts import TTSModel
import subprocess

ROOT = Path('/home/rustwood/.openclaw/workspace')
VOICE_REF = ROOT / 'daisy_voice_reference.wav'
SCRIPT = ROOT / 'conversations' / 'assets' / 'audio' / '2026-03-27-ai-agents-2026-chatbots-to-execution-script.txt'
WAV_OUT = ROOT / 'conversations' / 'assets' / 'audio' / '2026-03-27-ai-agents-2026-chatbots-to-execution.wav'
MP3_OUT = ROOT / 'conversations' / 'assets' / 'audio' / '2026-03-27-ai-agents-2026-chatbots-to-execution.mp3'
PAUSE_MS = 320


def split_chunks(text: str):
    chunks = []
    for block in text.split('\n\n'):
        block = ' '.join(line.strip() for line in block.splitlines() if line.strip())
        if block:
            chunks.append(block)
    return chunks


def silence(sr, ms=PAUSE_MS):
    return np.zeros(int(sr * ms / 1000), dtype=np.float32)


def main():
    text = SCRIPT.read_text(encoding='utf-8').strip()
    chunks = split_chunks(text)

    print('=' * 60)
    print('Daisy article audio — chunked render')
    print('=' * 60)
    print(f'Reference: {VOICE_REF}')
    print(f'Chunks: {len(chunks)}')

    tts = TTSModel.load_model('b6369a24', temp=0.7)
    voice_state = tts.get_state_for_audio_prompt(str(VOICE_REF))

    rendered = []
    sr = tts.sample_rate

    for i, chunk in enumerate(chunks, 1):
        print(f'[chunk {i}/{len(chunks)}] {chunk[:80]}')
        audio = tts.generate_audio(voice_state, chunk)
        arr = audio.detach().cpu().numpy().astype(np.float32)
        rendered.append(arr)
        if i != len(chunks):
            rendered.append(silence(sr))

    final = np.concatenate(rendered) if rendered else np.zeros(1, dtype=np.float32)
    wavfile.write(WAV_OUT, sr, final)
    print(f'WAV saved: {WAV_OUT}')

    subprocess.run([
        'ffmpeg', '-y', '-i', str(WAV_OUT), '-codec:a', 'libmp3lame', '-qscale:a', '2', str(MP3_OUT)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'MP3 saved: {MP3_OUT}')


if __name__ == '__main__':
    main()
