# Slides for the Funding & talks page

Drop the files in this folder with these exact names (any you don't have, skip):

| File | Talk |
|---|---|
| `ieee-bigdata-2020.pptx` | IEEE BigData 2020, oral |
| `simbig-2018.pptx` | SIMBig 2018, oral |
| `kdd-2018-epidamik-poster.pdf` | epiDAMIK workshop at KDD 2018, poster |
| `dshealth-kdd-2020-poster.pdf` | DSHealth workshop at KDD 2020, poster |
| `agu-2020-poster.pdf` | AGU Fall Meeting 2020, poster |
| `ucl-ir-evaluation-2024.pptx` | UCL guest lecture, Jan 2024 |
| `ucl-ir-evaluation-2025.pptx` | UCL guest lecture, Jan 2025 |
| `hull-open-mic-2024.pptx` | Hull Research Open Mic, Oct 2024 |
| `hny-crc-2025.pptx` | HNY Cancer Research Collaborative, Nov 2025 |
| `chcp-nlp-healthcare.pptx` | CHCP lecture on NLP in healthcare |

## Conversion (run from this folder, per deck; each result goes in `../../assets/slides/<name>/`)
```
NAME=ieee-bigdata-2020
mkdir -p ../../assets/slides/$NAME
soffice --headless --convert-to pdf --outdir /tmp/$NAME $NAME.pptx          # PowerPoint to PDF (no speaker notes)
gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile=../../assets/slides/$NAME/$NAME.pdf /tmp/$NAME/$NAME.pdf   # keep each PDF under 5 MB
pdftoppm -r 96 -scale-to-x 1280 -scale-to-y -1 -png ../../assets/slides/$NAME/$NAME.pdf /tmp/$NAME/s
for f in /tmp/$NAME/s-*.png; do cwebp -q 80 "$f" -o ../../assets/slides/$NAME/$(basename "${f%.png}").webp; done
```
PDF posters skip the first step. Before anything is published, look at a contact sheet of every slide and remove anything that should not be public: patient or NHS internal information, unpublished results, other people's photos, third-party logos and images.
