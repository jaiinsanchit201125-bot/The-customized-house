#!/bin/bash
# usage: make_reel.sh out.mp4 img1:sec img2:sec ...   (1080x1920 stills -> 30fps reel with slow push-in and silent audio)
set -e
out=$1; shift
i=0; parts=()
tmp=$(mktemp -d)
for spec in "$@"; do
  img=${spec%%:*}; sec=${spec##*:}
  frames=$(python3 -c "print(int(round($sec*30)))")
  ffmpeg -loglevel error -y -loop 1 -i "$img" -vf "scale=2160:3840,zoompan=z='min(1+0.0009*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$frames:s=1080x1920:fps=30,format=yuv420p" -frames:v $frames -c:v libx264 -preset veryfast -crf 20 "$tmp/p$i.mp4"
  echo "file '$tmp/p$i.mp4'" >> "$tmp/list.txt"; i=$((i+1))
done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/list.txt" -f lavfi -i anullsrc=r=44100:cl=stereo -shortest -c:v copy -c:a aac -b:a 128k -movflags +faststart "$out"
rm -rf "$tmp"
