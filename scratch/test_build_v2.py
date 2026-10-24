import re
import os

with open("highSchool/site/lessons/e3-8-3.html", "r", encoding="utf-8") as f:
    orig_html = f.read()

from test_e3_8_3_build import new_step2
from test_compact_sa import script_addition

step2_pat = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pat.search(orig_html), "Step 2 not found"
html_mod = step2_pat.sub(lambda m: new_step2, orig_html)

idx = html_mod.rfind('})();')
assert idx != -1, "Closing })(); not found"
html_mod = html_mod[:idx] + script_addition + '\n' + html_mod[idx:]

total_sz = len(html_mod.encode('utf-8'))
print(f"Total size: {total_sz} bytes ({total_sz/1024:.2f} KB)")
if total_sz <= 61440:
    print(f"SUCCESS! File size <= 60 KB! Headroom: {61440 - total_sz} bytes")
else:
    print(f"Over limit by: {total_sz - 61440} bytes")
