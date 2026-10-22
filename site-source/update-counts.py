"""Writes the three counts on the Profile page's "Funding, awards and talks" row from the lists on funding-talks.html.
   Usage (from site-source):  python3 update-counts.py"""
import pathlib, re
ROOT = pathlib.Path(__file__).parent.parent
ft = (ROOT / 'funding-talks.html').read_text()
count = lambda kind: len(re.findall(r'<li class="entry" data-kind="%s"' % kind, ft))
amount = re.search(r'id="amount"[^>]*>([^<]+)<', ft).group(1)
block = f'''<!--counts-->
      <li><a class="ftlink" href="funding-talks.html#funding"><b>{amount}</b><span>NHS-funded award</span></a></li>
      <li><a class="ftlink" href="funding-talks.html#talks"><b>{count('talks')}</b><span>talks and posters</span></a></li>
      <li><a class="ftlink" href="funding-talks.html#awards"><b>{count('awards')}</b><span>awards and fellowships</span></a></li>
      <!--/counts-->'''
idx = ROOT / 'index.html'
s = idx.read_text()
s = re.sub(r'<!--counts-->.*?<!--/counts-->', block, s, flags=re.S)
idx.write_text(s)
print('talks', count('talks'), '| awards', count('awards'), '| funding entries', count('funding'), '| amount', amount)
