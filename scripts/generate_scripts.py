#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 assets/js/data.js 生成 scripts/<模型id>.sh
==============================================
每个模型一个 .sh 文件，内容与站点详情页「部署推理脚本」区块一致：
  - 每个代码块以 "# ---------- 块标题 ----------" 注释分隔
  - 块内的 note 说明以 "# 注: ..." 注释追加
  - 文件头包含模型元信息

用法：
    python3 scripts/generate_scripts.py [--check]

说明：
    --check  只检查生成结果与现有文件是否一致（不写盘），用于 CI/回归。
    修改部署脚本请改 assets/js/data.js 中对应模型的 serve 字段，然后重新生成。
"""

import argparse
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(BASE, "assets", "js", "data.js")
OUT_DIR = os.path.join(BASE, "scripts")


def bracket_scan(text, start):
    """从 start 处的 [ 或 { 开始，返回与之匹配的 ] 或 } 之后的位置。
    支持双引号字符串与反引号模板字符串（其中可能含 { } [ ]）。"""
    depth = 0
    in_str = False
    in_tpl = False
    esc = False
    i = start
    while i < len(text):
        ch = text[i]
        if in_tpl:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == "`":
                in_tpl = False
        elif in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == "`":
                in_tpl = True
            elif ch == '"':
                in_str = True
            elif ch in "[{":
                depth += 1
            elif ch in "]}":
                depth -= 1
                if depth == 0:
                    return i + 1
        i += 1
    raise ValueError(f"括号不匹配（start={start}）")


def unescape_tpl(s):
    """把 JS 模板字符串原文还原为实际内容：\\x -> x（含 \\\\ -> \\、\\${ -> ${）。"""
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            out.append(s[i + 1])
            i += 2
        else:
            out.append(s[i])
            i += 1
    return "".join(out)


def find_tpl_end(text, start):
    """text[start] 必须是反引号，返回闭合反引号之后的位置（处理转义）。"""
    i = start + 1
    while i < len(text):
        if text[i] == "\\":
            i += 2
        elif text[i] == "`":
            return i + 1
        else:
            i += 1
    raise ValueError(f"模板字符串未闭合（start={start}）")


def parse_models():
    with open(DATA_JS, encoding="utf-8") as f:
        text = f.read()

    models = []
    for m in re.finditer(r'\n    id: "([^"]+)"', text):
        model_id = m.group(1)
        entry_start = text.rfind("\n  {", 0, m.start())
        if entry_start < 0:
            raise ValueError(f"模型 {model_id} 未找到条目起点")
        entry_end = bracket_scan(text, entry_start + 2)  # 指向 '}' 之后
        entry = text[entry_start:entry_end]

        def field(name):
            fm = re.search(name + r':\s*"([^"]*)"', entry)
            return fm.group(1) if fm else ""

        tasks_m = re.search(r"tasks:\s*\[([^\]]*)\]", entry)
        tasks = re.findall(r'"([^"]*)"', tasks_m.group(1)) if tasks_m else []

        serve_text = ""
        serve_m = re.search(r"serve:\s*\[", entry)
        if serve_m:
            serve_open = serve_m.end() - 1
            serve_end = bracket_scan(entry, serve_open)
            serve_text = entry[serve_open + 1:serve_end - 1]

        blocks = []
        pos = 0
        for bm in re.finditer(r'title:\s*"([^"]*)"\s*,\s*lang:\s*"([^"]*)"\s*,\s*code:\s*`', serve_text):
            tpl_start = serve_text.find("`", bm.end() - 1)
            tpl_end = find_tpl_end(serve_text, tpl_start)
            code = unescape_tpl(serve_text[tpl_start + 1:tpl_end - 1])
            note = ""
            nm = re.search(r'note:\s*"([^"]*)"', serve_text[tpl_end:])
            if nm:
                note = nm.group(1)
            blocks.append({"title": bm.group(1), "lang": bm.group(2), "code": code, "note": note})

        models.append({
            "id": model_id,
            "name": field("name"),
            "seriesName": field("seriesName"),
            "org": field("org"),
            "hfRepo": field("hfRepo"),
            "tasks": tasks,
            "blocks": blocks,
        })
    return models


def render_sh(model):
    lines = []
    lines.append("#!/usr/bin/env bash")
    lines.append("# ============================================================")
    lines.append(f"# {model['name']} —— 部署推理脚本")
    lines.append(f"# 系列: {model['seriesName']} ｜ 组织: {model['org']} ｜ 仓库: {model['hfRepo']}")
    lines.append(f"# 任务: {' / '.join(model['tasks'])}")
    lines.append("# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；")
    lines.append("# 可直接编辑本文件——页面（经 server.py）会同步显示修改；")
    lines.append("# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。")
    lines.append("# ============================================================")
    lines.append("")
    for b in model["blocks"]:
        lines.append(f"# ---------- {b['title']} ----------")
        lines.append(b["code"].rstrip())
        if b["note"]:
            lines.append("")
            lines.append("# 注: " + b["note"])
        lines.append("")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="生成 scripts/<模型id>.sh")
    ap.add_argument("--check", action="store_true", help="只检查与现有文件是否一致，不写盘")
    args = ap.parse_args()

    models = parse_models()
    model_ids = {m["id"] for m in models}
    os.makedirs(OUT_DIR, exist_ok=True)
    changed = 0
    for model in models:
        content = render_sh(model)
        path = os.path.join(OUT_DIR, f"{model['id']}.sh")
        if args.check:
            if not os.path.exists(path) or open(path, encoding="utf-8").read() != content:
                print(f"[check] 不一致: {path}")
                changed += 1
            continue
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        os.chmod(path, 0o755)
    # 清理已从 data.js 移除的模型的孤儿 .sh 文件
    for name in sorted(os.listdir(OUT_DIR)):
        if not name.endswith(".sh"):
            continue
        if name[:-3] not in model_ids:
            path = os.path.join(OUT_DIR, name)
            if args.check:
                print(f"[check] 孤儿文件（data.js 中已无此模型）: {path}")
                changed += 1
            else:
                os.remove(path)
                print(f"已删除孤儿脚本: {name}")
    print(f"{'检查完成' if args.check else '生成完成'}: {len(models)} 个模型 -> {OUT_DIR}"
          + (f"，{changed} 个不一致" if args.check else ""))
    if args.check and changed:
        sys.exit(1)


if __name__ == "__main__":
    main()
