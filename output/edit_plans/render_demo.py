from pathlib import Path
import subprocess
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output"
WORK = OUT / ".video-work"
VIDEO = ROOT / "video.mp4"
FFMPEG = "ffmpeg"
W, H = 1920, 1080
CREAM = (248, 246, 239)
GREEN = (42, 66, 55)
SAGE = (111, 133, 111)
MUTED = (107, 108, 99)

def run(args):
    subprocess.run([str(x) for x in args], cwd=ROOT, check=True)

def font(name, size):
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)

def make_hud(label, number):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.text((82, 31), "SKIN CASEFILE", font=font("georgiab.ttf", 25), fill=GREEN)
    d.text((83, 67), "YOUR SKIN JOURNEY, IN CONTEXT", font=font("arial.ttf", 14), fill=MUTED)
    d.text((1838, 54), f"{number}  /  {label}", font=font("arialbd.ttf", 15), fill=GREEN, anchor="ra")
    d.line((80, 119, 1840, 119), fill=(190, 194, 180, 230), width=1)
    d.rectangle((78, 140, 1842, 939), outline=(190, 194, 180, 210), width=2)
    d.line((80, 951, 1840, 951), fill=(190, 194, 180, 230), width=1)
    d.ellipse((1814, 984, 1830, 1000), fill=SAGE)
    return im

def make_endcard(path):
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    d.line((164, 158, 1756, 158), fill=(190, 194, 180), width=2)
    d.text((164, 109), "SKIN CASEFILE     /     A PERSONAL SKIN JOURNAL", font=font("arialbd.ttf", 19), fill=GREEN)
    d.text((164, 340), "Keep the context", font=font("georgia.ttf", 86), fill=GREEN)
    d.text((164, 440), "with the change.", font=font("georgiai.ttf", 86), fill=SAGE)
    d.text((164, 610), "A clearer record of what you noticed, when it happened,\nand the readings you can review over time.", font=font("arial.ttf", 30), fill=MUTED, spacing=16)
    d.rounded_rectangle((164, 790, 525, 860), radius=8, outline=SAGE, width=2)
    d.text((194, 808), "SKIN CASEFILE", font=font("arialbd.ttf", 22), fill=GREEN)
    d.ellipse((1510, 320, 1715, 525), outline=(210, 216, 204), width=2)
    d.ellipse((1564, 374, 1661, 471), fill=(226, 232, 220))
    im.save(path)

def make_summary_card(path):
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    d.line((164, 158, 1756, 158), fill=(190, 194, 180), width=2)
    d.text((164, 109), "SKIN CASEFILE     /     A CLEARER RECORD", font=font("arialbd.ttf", 19), fill=GREEN)
    d.text((164, 330), "Bring the whole", font=font("georgia.ttf", 78), fill=GREEN)
    d.text((164, 420), "story to the conversation.", font=font("georgiai.ttf", 78), fill=SAGE)
    d.text((164, 610), "Your notes. Dated check-ins. YouCam readings.\nTogether in a print-ready case summary.", font=font("arial.ttf", 30), fill=MUTED, spacing=16)
    d.rounded_rectangle((164, 790, 695, 860), radius=8, outline=SAGE, width=2)
    d.text((194, 808), "NOTICE  /  RECORD  /  REVIEW", font=font("arialbd.ttf", 20), fill=GREEN)
    d.ellipse((1510, 320, 1715, 525), outline=(210, 216, 204), width=2)
    d.ellipse((1564, 374, 1661, 471), fill=(226, 232, 220))
    im.save(path)

def make_context_card(path):
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    d.line((164, 158, 1756, 158), fill=(190, 194, 180), width=2)
    d.text((164, 109), "SKIN CASEFILE     /     MEASUREMENTS, WITH CONTEXT", font=font("arialbd.ttf", 19), fill=GREEN)
    d.text((164, 330), "A score is a record.", font=font("georgia.ttf", 78), fill=GREEN)
    d.text((164, 420), "It is not a diagnosis.", font=font("georgiai.ttf", 78), fill=SAGE)
    d.text((164, 610), "It can help you notice a difference.\nIt cannot tell you what caused it.", font=font("arial.ttf", 30), fill=MUTED, spacing=16)
    d.rounded_rectangle((164, 790, 610, 860), radius=8, outline=SAGE, width=2)
    d.text((194, 808), "NOTICE  /  RECORD  /  REVIEW", font=font("arialbd.ttf", 20), fill=GREEN)
    d.ellipse((1510, 320, 1715, 525), outline=(210, 216, 204), width=2)
    d.ellipse((1564, 374, 1661, 471), fill=(226, 232, 220))
    im.save(path)

def make_music(path, seconds=62, sr=48000):
    # Original, quiet sustained chord bed; no third-party recording or samples.
    n = int(seconds * sr)
    t = np.arange(n, dtype=np.float64) / sr
    chords = [([146.83, 220.00, 293.66, 369.99], 0),
              ([130.81, 196.00, 261.63, 329.63], 10),
              ([110.00, 164.81, 220.00, 261.63], 20),
              ([98.00, 146.83, 196.00, 246.94], 30),
              ([130.81, 196.00, 261.63, 329.63], 40),
              ([146.83, 220.00, 293.66, 369.99], 50)]
    mono = np.zeros(n, dtype=np.float64)
    for notes, start in chords:
        a = int(start * sr)
        b = min(n, int((start + 12) * sr))
        local = t[a:b] - start
        env = np.minimum(1, local / 1.8) * np.minimum(1, (12 - local) / 2.2)
        env = np.maximum(0, env)
        chord = np.zeros(b - a)
        for f in notes:
            chord += np.sin(2 * np.pi * f * local) + 0.15 * np.sin(4 * np.pi * f * local)
        mono[a:b] += chord * env / len(notes)
    fade = np.minimum(1, t / 1.5) * np.minimum(1, (seconds - t) / 2.0)
    mono *= np.maximum(0, fade) * 0.035
    stereo = np.column_stack((mono, mono))
    # 16-bit PCM WAV for predictable FFmpeg input.
    import wave
    pcm = np.clip(stereo * 32767, -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(sr); wf.writeframes(pcm.tobytes())

def make_ass(vtt_path, ass_path):
    blocks = vtt_path.read_text(encoding="utf-8-sig").strip().split("\n\n")
    def stamp(value):
        clock, millis = value.split(",")
        h, m, s = clock.split(":")
        return f"{int(h)}:{int(m):02d}:{int(s):02d}.{int(millis)//10:02d}"
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,28,&H00FFFFFF,&H0000FFFF,&HAA35493D,&HAA35493D,0,0,0,0,100,100,0,0,3,1,0,2,90,90,28,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    for block in blocks:
        lines = block.splitlines()
        if len(lines) < 3 or "-->" not in lines[1]:
            continue
        start, end = [x.strip() for x in lines[1].split("-->")]
        text = "\\N".join(x.replace("{", "(").replace("}", ")") for x in lines[2:])
        events.append(f"Dialogue: 0,{stamp(start)},{stamp(end)},Default,,0,0,28,,{text}")
    ass_path.write_text(header + "\n".join(events) + "\n", encoding="utf-8")

def make_vtt(srt_path, vtt_path):
    blocks = srt_path.read_text(encoding="utf-8-sig").strip().split("\n\n")
    cues = []
    for block in blocks:
        lines = block.splitlines()
        if len(lines) >= 3 and "-->" in lines[1]:
            lines[1] = lines[1].replace(",", ".")
            cues.append("\n".join(lines[1:]))
    vtt_path.write_text("WEBVTT\n\n" + "\n\n".join(cues) + "\n", encoding="utf-8")

def main():
    WORK.mkdir(exist_ok=True)
    (OUT / "motion_assets").mkdir(exist_ok=True)
    (OUT / "final_videos").mkdir(exist_ok=True)
    clips = [
        (14, 8, "WHY IT GETS LOST", "01", None),
        (29, 6, "ONE PLACE FOR THE STORY", "02", None),
        (49, 7, "START WITH YOUR WORDS", "03", None),
        (78, 8, "YOUCAM SKIN ANALYSIS", "04", None),
        (101, 4, "THE RETURNED READINGS", "05", None),
        (144, 5, "TWO DATED CHECK-INS", "06", (455, 390, 1120, 300)),
        (168, 4.13, "PRINT-READY SUMMARY", "09", (550, 30, 1180, 260)),
    ]
    pieces = []
    summary_png = OUT / "motion_assets" / "summary-card.png"
    make_summary_card(summary_png)
    summary_hud = WORK / "hud-summary.png"
    make_hud("A CASE YOU CAN SHARE", "07").save(summary_hud)
    summary_card = WORK / "summary-card.mp4"
    run([FFMPEG, "-y", "-loop", "1", "-i", summary_png, "-t", "3", "-vf", "fade=t=in:st=0:d=0.35,fps=30,setsar=1,format=yuv420p",
         "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", summary_card])
    summary_composite = WORK / "summary-card-composite.mp4"
    run([FFMPEG, "-y", "-i", summary_card, "-i", summary_hud,
         "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto[v]", "-map", "[v]", "-an",
         "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", summary_composite])
    context_png = OUT / "motion_assets" / "context-card.png"
    make_context_card(context_png)
    context_hud = WORK / "hud-context.png"
    make_hud("READ THE SCORE WITH CONTEXT", "07").save(context_hud)
    context_still = WORK / "context-card.mp4"
    run([FFMPEG, "-y", "-loop", "1", "-i", context_png, "-t", "10", "-vf", "fade=t=in:st=0:d=0.35,fps=30,setsar=1,format=yuv420p",
         "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", context_still])
    context_composite = WORK / "context-card-composite.mp4"
    run([FFMPEG, "-y", "-i", context_still, "-i", context_hud,
         "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto[v]", "-map", "[v]", "-an",
         "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", context_composite])
    for i, (start, duration, label, number, crop) in enumerate(clips):
        hud = WORK / f"hud-{i:02d}.png"
        make_hud(label, number).save(hud)
        filters = []
        if crop:
            x, y, cw, ch = crop
            filters.append(f"crop={cw}:{ch}:{x}:{y}")
        filters += ["scale=1760:790:force_original_aspect_ratio=decrease:flags=lanczos",
                    "pad=1760:795:(ow-iw)/2:(oh-ih)/2:color=0xf8f6ef",
                    "pad=1920:1080:80:142:color=0xf8f6ef",
                    "fps=30,setsar=1,format=yuv420p"]
        vf = ",".join(filters)
        dst = WORK / f"clip-{i:02d}.mp4"
        run([FFMPEG, "-y", "-ss", start, "-i", VIDEO, "-i", hud, "-t", duration,
             "-filter_complex", f"[0:v]{vf}[base];[base][1:v]overlay=0:0:format=auto[v]",
             "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18",
             "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", dst])
        if i == len(clips) - 1:
            pieces.append(summary_composite)
        pieces.append(dst)
        if i == len(clips) - 2:
            pieces.append(context_composite)

    concat_file = WORK / "segments.txt"
    concat_file.write_text("\n".join(f"file '{p.as_posix()}'" for p in pieces) + "\n", encoding="utf-8")
    montage = WORK / "montage.mp4"
    run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_file, "-c", "copy", montage])

    end_png = OUT / "motion_assets" / "end-card.png"
    make_endcard(end_png)
    end_mp4 = WORK / "end-card.mp4"
    run([FFMPEG, "-y", "-loop", "1", "-i", end_png, "-t", "7", "-vf", "fade=t=in:st=0:d=0.5,fps=30,setsar=1,format=yuv420p",
         "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", end_mp4])
    all_video = WORK / "picture.mp4"
    run([FFMPEG, "-y", "-i", montage, "-i", end_mp4, "-filter_complex",
         "[0:v]setsar=1,fps=30[v0];[1:v]setsar=1,fps=30[v1];[v0][v1]concat=n=2:v=1:a=0[v]", "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-pix_fmt", "yuv420p", all_video])

    captions = OUT / "captions" / "skin-casefile-demo.srt"
    vtt = OUT / "captions" / "skin-casefile-demo.vtt"
    ass = OUT / "captions" / "skin-casefile-demo.ass"
    make_ass(captions, ass)
    make_vtt(captions, vtt)
    music = WORK / "original-ambient.wav"
    make_music(music, 64)
    out = OUT / "final_videos" / "skin-casefile-hackathon-demo.mp4"
    subpath = "output/captions/skin-casefile-demo.ass"
    subtitle_filter = f"subtitles=filename='{subpath}'"
    run([FFMPEG, "-y", "-i", all_video, "-i", OUT / "voiceovers" / "skin-casefile-ezinne.mp3", "-i", music,
         "-filter_complex", f"[0:v]{subtitle_filter}[v];[1:a]loudnorm=I=-16:TP=-1.5:LRA=11[voice];[2:a]volume=0.22,afade=t=out:st=59:d=3[bed];[voice][bed]amix=inputs=2:duration=longest:dropout_transition=1[a]",
         "-map", "[v]", "-map", "[a]", "-shortest", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         "-metadata", "title=Skin Casefile | Hackathon Demo", "-metadata", "comment=YouCam Skin Analysis workflow; no diagnostic claims", out])
    print(out)
    shutil.rmtree(WORK, ignore_errors=True)

if __name__ == "__main__":
    main()
