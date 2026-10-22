"""Copy third-party libraries and fonts into ../assets, and rebuild classic.html.
   Usage (from this folder):  npm install   then   python3 build.py
   The pages themselves (../index.html, ../research.html, ../assets/css, ../assets/js) are plain files: edit them directly."""
import base64, pathlib, shutil
HERE = pathlib.Path(__file__).parent
NM = HERE / 'node_modules'
OUT = HERE.parent
b64 = lambda p: base64.b64encode((NM / p).read_bytes()).decode()
js = lambda p: (NM / p).read_text()

def copy(src, dst):
    dst = OUT / dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(NM / src, dst)

# vendor scripts (loaded with defer by both pages)
copy('gsap/dist/gsap.min.js', 'assets/js/vendor/gsap.min.js')
copy('gsap/dist/ScrollTrigger.min.js', 'assets/js/vendor/ScrollTrigger.min.js')
copy('lenis/dist/lenis.min.js', 'assets/js/vendor/lenis.min.js')

# fonts (preloaded by both pages)
copy('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2', 'assets/fonts/bricolage-grotesque.woff2')
copy('@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2', 'assets/fonts/instrument-sans.woff2')

# classic.html: the original typographic site, still one self-contained file
def inline(src, parts):
    for k, v in parts.items():
        assert '</script' not in v.lower(), k
        assert src.count(k) == 1, f'placeholder {k} missing'
        src = src.replace(k, v)
    return src

v1 = (HERE / 'v1-classic' / 'src.html').read_text()
v1 = inline(v1, {'/*__GSAP__*/': js('gsap/dist/gsap.min.js'), '/*__ST__*/': js('gsap/dist/ScrollTrigger.min.js')})
v1 = v1.replace('__IMBUE__', b64('@fontsource-variable/imbue/files/imbue-latin-opsz-normal.woff2')) \
       .replace('__ALB400__', b64('@fontsource/albert-sans/files/albert-sans-latin-400-normal.woff2')) \
       .replace('__ALB500__', b64('@fontsource/albert-sans/files/albert-sans-latin-500-normal.woff2'))
(OUT / 'classic.html').write_text(v1)
print('Copied vendor files and fonts into', OUT / 'assets', 'and rebuilt', OUT / 'classic.html')
