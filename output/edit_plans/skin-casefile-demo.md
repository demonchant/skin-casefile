# Skin Casefile Demo Edit Plan

## Source and story

- Primary recording: `video.mp4` (172.133 seconds, 1736 × 784, 30 fps). Original retained unchanged.
- No other relevant source video was found. The landing page, dashboard, recorded case form, YouCam analysis result, two-entry timeline, and print summary are all shown from the real screen recording.
- Story: a skin concern is easy to lose track of; Skin Casefile records a user's concern and context, sends a consented photo through YouCam's File API and Skin Analysis API, stores the returned readings with dated check-ins, and provides a print-ready case summary.
- The narration calls the two check-ins real, as confirmed by the project owner. It makes no diagnostic or causal claim about the measurements.

## Cut map

| Final time | Picture | Purpose |
|---|---|---|
| 0–8 s | Landing-page concern prompt | Open on the problem |
| 8–14 s | Casebook/dashboard | Introduce the record |
| 14–21 s | Concern form | Show the user's own words and context |
| 21–29 s | Photo and consent workflow | Show YouCam upload and consent |
| 29–33 s | Provider result | Show the returned Skin Analysis readings |
| 33–38 s | Two-reading timeline | Show the real comparison view |
| 38–48 s | Context card | Explain that a score is not a diagnosis or cause |
| 48–51 s | Summary card | Connect the record to a useful conversation |
| 51–55.13 s | Cropped print-summary preview | Show the actual case summary without printer controls |
| 55.13–62.13 s | Closing card | Brand and value statement |

## Art direction and sound

- Warm cream, sage, and evergreen editorial treatment matching the website.
- 16:9 canvas, original screen aspect preserved; no stretching.
- Minimal chapter labels, restrained framing, two typographic cards, and a clean closing card.
- Nigerian English voice `en-NG-EzinneNeural` generated with Edge TTS.
- Original synthesized ambient bed; source recording audio removed. Captions are burned into the MP4, with separate SRT and ASS files.

## Rebuild

From the project root, with FFmpeg, Python, Pillow, NumPy, and the generated narration file available, run:

```powershell
python output/edit_plans/render_demo.py
```

The script reads the untouched `video.mp4` and writes the final MP4 and supporting assets under `output/`.
