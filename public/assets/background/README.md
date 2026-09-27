# Background assets

## What is here

| File | What it is | Size |
| --- | --- | --- |
| `cabin-background.mp4` | The live background. 848×478, 7s, 24fps, H.264, no audio track. | ~876 KB |
| `cabin-poster.webp` | Frame 0 of the above. First paint, and the entire background on mobile. | ~42 KB |
| `cabin-poster.jpg` | Same frame as JPEG, for the Open Graph / social card. | ~44 KB |
| `cabin-background-alt.mp4` | The other cabin clip, same processing. Kept as an alternative. | ~874 KB |

`.mp4` files in this folder are **gitignored** — they are binary and would bloat
history. Upload them with the deploy, or switch to Git LFS if you want them
versioned.

## What was done to the source clip, and why

The source was a WhatsApp-delivered file. Three problems were found and fixed:

**1. It had an audio track.** A muted background video does not need one. It was
128 kbps of pure waste — about 13% of the file. Stripped.

**2. It did not loop.** Measured, the jump from the last frame back to the first
was **33× larger** than a typical frame-to-frame step — an obvious visible cut
every few seconds. Veo was asked for matching start/end frames and did not
deliver them, because it produced a continuous dolly-in: the camera simply is
not in the same place at the end as at the start.

Fixed by dropping the first second and cross-fading the tail back into it, so
the clip now ends on the frame it starts on:

```
ffmpeg -i source.mp4 -filter_complex \
  "[0:v]split[body][pre];\
   [body]trim=start=1,setpts=PTS-STARTPTS[b];\
   [pre]trim=end=1,setpts=PTS-STARTPTS[p];\
   [b][p]xfade=transition=fade:duration=1:offset=6,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -profile:v high -crf 21 -preset slow \
  -movflags +faststart cabin-background.mp4
```

After: seam is **2.0×** a normal frame step, i.e. indistinguishable from the
clip's own motion. Cost: 8s becomes 7s.

**3. The moov atom was at the end.** `-movflags +faststart` moves it to the
front so the browser can start playing before the whole file arrives.

## The real remaining problem

**This is 848×478. That is not your original.** WhatsApp re-encoded it and threw
away more than half the pixels — the Veo output was 1280×720. Stretched across a
1080p viewport this is a 2.3× upscale, and on a larger display it is worse. It
will look soft, and it is the first thing anyone sees.

**Send the original file out of WhatsApp** (as a *document*, not as a video — that
is what stops the re-encode), or re-download it from Veo, then re-run the ffmpeg
command above on that.

## If you regenerate the video

The thing to change in the Veo prompt is the camera. Ask for a **locked-off or
near-static camera** — the current "slow cinematic dolly-in" is exactly what makes
a loop impossible, because the start and end framing can never match. A static
shot with only ambient motion (trees, mist, steam, firelight) loops perfectly and
needs no crossfade at all.

Also worth asking for: keep the **left third of frame darker and free of hotspots**.
That is where the headline sits, and it is currently the only zone with enough
contrast headroom.

## Replacing these files

Keep the same filenames and no code changes are needed. If the dimensions or
duration change, update `background` in `src/content/home.ts`, and re-run the
scrim measurement described in `docs/SPEC.md` — the overlay tokens are derived
from this specific footage.
