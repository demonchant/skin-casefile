# Skin Casefile demo video — QA report

**Reviewed:** 2026-10-29
**Final file:** `output/final_videos/skin-casefile-hackathon-demo.mp4`
**Public video URL:** https://youtu.be/CITNpW-76z8 (provided by project owner; page fetch was blocked by this environment's web cache, so public visibility was not independently confirmed)

## Official submission rules checked

Official source: [YouCam API Skin AI & eCommerce VTO Hackathon rules](https://youcam-api-skin-ai-ecommerce.devpost.com/rules), checked 2026-10-29.

The official rules require a 1–3 minute publicly accessible video on YouTube (preferred), Vimeo, or Youku, demonstrating the project on its target device and explaining the YouCam API used. They also prohibit third-party trademarks and copyrighted material without permission. The video is 62.133 seconds and identifies YouCam File API and Skin Analysis API while showing browser footage and the returned measurements. The user supplied a YouTube link, but its reachability could not be confirmed here. The final entrant must ensure public visibility and add this URL to the Devpost form.

The official rules checked do not specify resolution, aspect ratio, codec, frame rate, or file-size cap. These export choices are for compatibility and are not represented as official requirements.

## What the video demonstrates

The edit opens with the user's problem, introduces Skin Casefile, then shows the casebook, concern record, consented photo-analysis workflow, returned YouCam readings, two dated readings in the timeline, interpretation limits, and the print-summary view. It closes with the product name and value statement. The narration describes the check-ins as real and avoids diagnostic or causal claims. The app footage and recorded API result are from the supplied screen recording.

## Export and verification

- **Duration:** 62.133 seconds (within the official 60–180 second range).
- **Container/video/audio:** MP4, H.264, AAC stereo, 48 kHz.
- **Picture:** 1920 × 1080, 16:9, 30 fps.
- **Size:** 4,982,307 bytes.
- **SHA-256:** `A5DD4C66F20711E3CEB16552183DF64101CE9292313579E84FA4497CBB41554C`.
- **Decode:** FFmpeg decoded the entire final file to a null sink with exit status 0.
- **Black-frame check:** no black interval of 0.20 seconds or longer was detected.
- **Visual inspection:** contact sheet and selected full-resolution frames reviewed. Caption scale was corrected, blank scrolling removed, and printer controls/conflicting note cropped from the print shot.
- **Captions:** SRT, VTT, and ASS files included; text compared against narration script.
- **Audio:** Nigerian English female Ezinne neural voice; original synthesized ambient bed. No third-party music or stock footage added.
- **Source integrity:** `video.mp4` was read only and not overwritten.

## Files

- Final video: `output/final_videos/skin-casefile-hackathon-demo.mp4`
- Narration: `output/scripts/skin-casefile-demo.txt`
- Voice-over: `output/voiceovers/skin-casefile-ezinne.mp3`
- Captions: `output/captions/skin-casefile-demo.srt`, `.vtt`, `.ass`
- Rebuild script: `output/edit_plans/render_demo.py`
- Edit plan: `output/edit_plans/skin-casefile-demo.md`
- Visual checks: `output/reports/final-contact.jpg`, `output/reports/final-selected-frames.jpg`

## Submission status

The video export and local supporting files are present. The project owner supplied a public YouTube URL, but this environment could not fetch the video page to independently verify visibility. Devpost submission and submission receipt are not claimed.
