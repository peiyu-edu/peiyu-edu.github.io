with open("highSchool/site/lessons/e3-8-3.html", "r", encoding="utf-8") as f:
    text = f.read()

# Replace tab HTML
old_tabs = '''<div id="m-chi-tabs" style="display:flex; gap:6px;">
<button type="button" class="micro-tab active" data-tab="1" style="padding:3px 8px; font-size:12px; border-radius:4px; border:1px solid var(--line); background:var(--accent); color:#fff; cursor:pointer;">① 比例条形直觉</button>
<button type="button" class="micro-tab" data-tab="2" style="padding:3px 8px; font-size:12px; border-radius:4px; border:1px solid var(--line); background:transparent; color:var(--fg); cursor:pointer;">② 频数偏离期望</button>
<button type="button" class="micro-tab" data-tab="3" style="padding:3px 8px; font-size:12px; border-radius:4px; border:1px solid var(--line); background:transparent; color:var(--fg); cursor:pointer;">③ 反证决策拒绝域</button>
</div>'''

new_tabs = '''<div class="micro-tabs" id="m-chi-tabs">
<button class="micro-tab active" data-tab="1">① 比例条形直觉</button>
<button class="micro-tab" data-tab="2">② 频数偏离期望</button>
<button class="micro-tab" data-tab="3">③ 反证决策拒绝域</button>
</div>'''

assert old_tabs in text, "old_tabs not found"
text = text.replace(old_tabs, new_tabs)

# Replace tab click JS
old_click = '''tabs.forEach(function(btn) {
btn.addEventListener("click", function() {
tabs.forEach(function(b) {
b.classList.remove("active");
b.style.background = "transparent";
b.style.color = "var(--fg)";
});
btn.classList.add("active");
btn.style.background = "var(--accent)";
btn.style.color = "#fff";
var tab = btn.getAttribute("data-tab");
if (tab === "1") drawTab1();
else if (tab === "2") drawTab2();
else if (tab === "3") drawTab3();
});
});'''

new_click = '''tabs.forEach(function(tab) {
tab.addEventListener("click", function() {
tabs.forEach(function(t) { t.classList.remove("active"); });
tab.classList.add("active");
var idx = tab.getAttribute("data-tab");
if (idx === "1") drawTab1();
else if (idx === "2") drawTab2();
else if (idx === "3") drawTab3();
});
});'''

assert old_click in text, "old_click not found"
text = text.replace(old_click, new_click)

with open("highSchool/site/lessons/e3-8-3.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated tabs successfully!")
