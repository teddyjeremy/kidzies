# Audio credits

All sounds and music in Kidzies are original recordings rendered from scratch by
`scripts/make-audio.py` (sine-wave bells, soft noise and a simple pad, mixed with numpy
and encoded with ffmpeg). No third-party samples are used.

Licence: **CC0 1.0 Universal** (public domain dedication) — © 2026 Jeremy Teddy Ndeda,
dedicated to the public domain. You may reuse them for any purpose without attribution.

| File (`public/audio/`) | Used for | Source | Licence |
| --- | --- | --- | --- |
| `click.ogg` / `.mp3` | Soft button click | Original, `scripts/make-audio.py` | CC0 1.0 |
| `pop.ogg` / `.mp3` | Bubble pop when tapping toys and places | Original, `scripts/make-audio.py` | CC0 1.0 |
| `correct.ogg` / `.mp3` | Warm success chime | Original, `scripts/make-audio.py` | CC0 1.0 |
| `try-again.ogg` / `.mp3` | Gentle try-again tone | Original, `scripts/make-audio.py` | CC0 1.0 |
| `celebrate.ogg` / `.mp3` | Celebration sparkle | Original, `scripts/make-audio.py` | CC0 1.0 |
| `playground-loop.ogg` / `.mp3` | Quiet background music in the playground | Original, `scripts/make-audio.py` | CC0 1.0 |

Narration uses the device's built-in speech voice and is not bundled.

## Behaviour

- Files are fetched only the first time a sound is played (Ogg Vorbis, MP3 fallback for Safari).
- The playground music is quiet (about 12% volume), starts only after the first tap, fades in, and stops when leaving the playground.
- The Sound on/off switch mutes effects, music and narration together, and is remembered on the device.
- With reduced motion requested, background music does not play and the celebration sparkle is replaced by the simple chime.
