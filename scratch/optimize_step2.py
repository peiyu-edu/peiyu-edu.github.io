import re
from test_e3_8_3_build import new_step2

# Let's see how much we can compact new_step2
print("Original new_step2 bytes:", len(new_step2.encode('utf-8')))

# 1. Compact whitespace in new_step2
lines = [l.strip() for l in new_step2.splitlines() if l.strip()]
compact = '\n'.join(lines)
print("Stripped new_step2 bytes:", len(compact.encode('utf-8')))
