#!/usr/bin/env bash
# Builds the public CV PDF from the LaTeX sources, without the phone number.
# The LaTeX sources themselves are not changed: everything happens in a temporary copy.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cv_dir="$(cd "$here/../.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf -- "$tmp"' EXIT
cp "$cv_dir"/*.tex "$cv_dir"/*.sty "$cv_dir"/*.bib "$tmp"/
convert "$cv_dir/photo.png" -resize 700x "$tmp/photo.png"
sed -i '/\\faPhone/d' "$tmp/cv-llt.tex"
cd "$tmp"
pdflatex -interaction=nonstopmode cv-llt.tex >/dev/null || true
biber cv-llt >/dev/null
pdflatex -interaction=nonstopmode cv-llt.tex >/dev/null || true
pdflatex -interaction=nonstopmode cv-llt.tex >/dev/null || true
mkdir -p "$here/public/cv"
cp cv-llt.pdf "$here/public/cv/cv.pdf"
pdfinfo cv-llt.pdf | grep -E 'Pages|File size'
