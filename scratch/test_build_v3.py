import re
import os

with open("highSchool/site/lessons/e3-8-3.html", "r", encoding="utf-8") as f:
    orig_html = f.read()

from test_e3_8_3_build import new_step2
from test_compact_sa import script_addition

# Strip blank lines and extra leading/trailing whitespace
compact_step2 = '\n'.join([l.strip() for l in new_step2.splitlines() if l.strip()])
compact_script = '\n'.join([l.strip() for l in script_addition.splitlines() if l.strip() and not l.strip().startswith('//')])

step2_pat = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pat.search(orig_html), "Step 2 not found"
html_mod = step2_pat.sub(lambda m: compact_step2, orig_html)

idx = html_mod.rfind('})();')
assert idx != -1, "Closing })(); not found"
html_mod = html_mod[:idx] + '\n' + compact_script + '\n' + html_mod[idx:]

total_sz = len(html_mod.encode('utf-8'))
print(f"Total size: {total_sz} bytes ({total_sz/1024:.2f} KB)")
assert total_sz <= 61440, f"Exceeded limit by {total_sz - 61440} bytes!"
print(f"Passed limit check! Headroom: {61440 - total_sz} bytes")

with open("highSchool/site/lessons/e3-8-3.html", "w", encoding="utf-8") as f:
    f.write(html_mod)

print("Saved to e3-8-3.html")
