with open("highSchool/site/QUEUE-step2.md", "r", encoding="utf-8") as f:
    text = f.read()

# Update header
old_header = '''> **状态标记**：`待做` → `进行中（<host>/<agent>，日期）` → `已上线（0 报错通过）`'''
new_header = '''> **状态标记**：`待做` → `进行中（<host>/<agent>，日期）` → `已上线（0 报错通过）`
> **整体进展**：**73 / 73 节 100% 全量上线验收闭环（全站 0 报错、全部单页 <= 60 KB、全部通过 SPEC-step2-explain 五大件质检规范）！**'''

assert old_header in text
text = text.replace(old_header, new_header)

# Update Chapter 8 table
old_ch8 = '''### 第 8 章 成对数据的统计分析（3 节）
| 编号 | 章节名称 | 状态 | 升级重点 | 质检结果 |
|---|---|---|---|---|
| e3-8-1 | 8.1 成对数据的统计相关性 | 进行中（mac/agy，2026-10-24） | 散点图与相关系数r正负强弱微图解、相关性并不等同于因果律、三大翻车现场 | 待做 |
| e3-8-2 | 8.2 一元线性回归模型及其应用 | 进行中（mac/agy，2026-10-24） | 最小二乘法残差平方和最小微图解、样本中心点必过性、三大翻车现场 | 待做 |
| e3-8-3 | 8.3 列联表与独立性检验 | 进行中（mac/agy，2026-10-24） | 2x2列联表与卡方统计量微图解、小概率反证法决策、三大翻车现场 | 待做 |'''

new_ch8 = '''### 第 8 章 成对数据的统计分析（3 节，全量完成）
| 编号 | 章节名称 | 状态 | 升级重点 | 质检结果 |
|---|---|---|---|---|
| e3-8-1 | 8.1 成对数据的统计相关性 | 已上线（mac/agy，2026-10-24） | 散点图与相关系数r正负强弱微图解、相关性并不等同于因果律、三大翻车现场 | 0 报错（50.76 KB） |
| e3-8-2 | 8.2 一元线性回归模型及其应用 | 已上线（mac/agy，2026-10-24） | 最小二乘法残差平方和最小微图解、样本中心点旋转枢轴、三大翻车现场 | 0 报错（55.40 KB） |
| e3-8-3 | 8.3 列联表与独立性检验 | 已上线（mac/agy，2026-10-24） | 2x2列联表等高条形图与卡方偏离微图解、反证决策拒绝域、三大翻车现场 | 0 报错（57.33 KB） |'''

assert old_ch8 in text
text = text.replace(old_ch8, new_ch8)

with open("highSchool/site/QUEUE-step2.md", "w", encoding="utf-8") as f:
    f.write(text)

print("QUEUE-step2.md updated successfully!")
