#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 assets/js/data.js 生成 models/<模型id>/ 三件套
==================================================
每个模型文件夹包含：
  - README.md   # 模型简介（介绍/参数量/结构/权重地址/参考资料）
  - deploy.sh   # 部署推理脚本（原 scripts/<id>.sh 迁移）
  - perf.json   # 性能数据 {"columns": [...], "rows": [...]}

首次迁移时从 perf-data.json 回填已有性能数据；
后续修改 data.js 后重新生成（--force 覆盖手改的 deploy.sh）。

用法：
    python3 generate_models.py [--check] [--only id1,id2] [--force]
"""

import argparse
import json
import os
import re
import sys
import shutil

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_JS = os.path.join(BASE, "assets", "js", "data.js")
MODELS_DIR = os.path.join(BASE, "models")
OLD_PERF_FILE = os.path.join(BASE, "perf-data.json")
OLD_SCRIPTS_DIR = os.path.join(BASE, "scripts")

# ──────────── JS 解析工具 ────────────

def bracket_scan(text, start):
    """从 start 处的 [ 或 { 开始，返回与之匹配的 ] 或 } 之后的位置。"""
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
    """把 JS 模板字符串原文还原为实际内容。"""
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
    """text[start] 必须是反引号，返回闭合反引号之后的位置。"""
    i = start + 1
    while i < len(text):
        if text[i] == "\\":
            i += 2
        elif text[i] == "`":
            return i + 1
        else:
            i += 1
    raise ValueError(f"模板字符串未闭合（start={start}）")


def find_tpl_body(text, start):
    """返回模板字符串内容（不含反引号）。"""
    tpl_end = find_tpl_end(text, start)
    return unescape_tpl(text[start + 1:tpl_end - 1]), tpl_end


def js_array(text, start):
    """解析 JS 数组 [...]，返回元素列表和结束位置。start 指向 '['。"""
    end = bracket_scan(text, start)
    body = text[start + 1:end - 1]
    # 提取字符串元素
    items = re.findall(r'"([^"]*)"', body)
    return items, end


def js_obj_array(text, start):
    """解析 JS 对象数组 [{key: "val", ...}, ...]，返回 list of dict 和结束位置。"""
    end = bracket_scan(text, start)
    body = text[start + 1:end - 1]
    objs = []
    pos = 0
    while True:
        obj_start = body.find("{", pos)
        if obj_start < 0:
            break
        obj_end = bracket_scan(body, obj_start)
        obj_text = body[obj_start:obj_end]
        obj = {}
        for km in re.finditer(r'(\w+):\s*"([^"]*)"', obj_text):
            obj[km.group(1)] = km.group(2)
        objs.append(obj)
        pos = obj_end
    return objs, end


# ──────────── HTML → Markdown 转换 ────────────

def html_to_md(html):
    """将简单的 HTML 字符串转换为 Markdown。支持 p/strong/em/br/ul/ol/li/a。"""
    s = html.strip()
    # 去掉最外层空白
    s = re.sub(r'\n\s+', '\n', s)
    s = re.sub(r'^\s+', '', s)
    s = re.sub(r'\s+$', '', s)

    # 先处理列表（ul/ol），需要保留缩进与 - 前缀
    # 提取并替换 ul/ol 块
    list_blocks = []

    def replace_list(m):
        tag = m.group(1)  # ul or ol
        body = m.group(2)
        items = re.findall(r'<li>(.*?)</li>', body, re.DOTALL)
        prefix = "- " if tag == "ul" else "1. "
        result = "\n".join(prefix + inline_html_to_md(it.strip()) for it in items)
        list_blocks.append(result)
        return f"\n<!--LISTBLOCK{len(list_blocks) - 1}-->\n"

    s = re.sub(r'<(ul|ol)>(.*?)</\1>', replace_list, s, flags=re.DOTALL)

    # 链接
    s = re.sub(r'<a\s+href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', s)

    # 段落
    s = re.sub(r'<p>(.*?)</p>', lambda m: "\n\n" + inline_html_to_md(m.group(1)) + "\n", s, flags=re.DOTALL)

    # 换行
    s = s.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')

    # 行内格式
    s = inline_html_to_md(s)

    # 恢复列表块
    for i, block in enumerate(list_blocks):
        s = s.replace(f"<!--LISTBLOCK{i}-->", "\n" + block + "\n")

    # 清理多余空行
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()


def inline_html_to_md(s):
    """行内 HTML → Markdown。"""
    s = re.sub(r'<strong>(.*?)</strong>', r'**\1**', s)
    s = re.sub(r'<b>(.*?)</b>', r'**\1**', s)
    s = re.sub(r'<em>(.*?)</em>', r'*\1*', s)
    s = re.sub(r'<code>(.*?)</code>', r'`\1`', s)
    return s


# ──────────── 数据解析 ────────────

def parse_models():
    with open(DATA_JS, encoding="utf-8") as f:
        text = f.read()

    models = []
    for m in re.finditer(r'\n    id: "([^"]+)"', text):
        model_id = m.group(1)
        entry_start = text.rfind("\n  {", 0, m.start())
        if entry_start < 0:
            raise ValueError(f"模型 {model_id} 未找到条目起点")
        entry_end = bracket_scan(text, entry_start + 2)
        entry = text[entry_start:entry_end]

        def field(name):
            fm = re.search(name + r':\s*"([^"]*)"', entry)
            return fm.group(1) if fm else ""

        def tpl_field(name):
            """提取模板字符串字段内容。"""
            fm = re.search(name + r':\s*`', entry)
            if not fm:
                return ""
            body, _ = find_tpl_body(entry, fm.end() - 1)
            return body

        def nested_tpl_field(parent_name, field_name):
            """提取嵌套对象中的模板字符串字段，如 arch: { text: `...` }。"""
            pm = re.search(parent_name + r':\s*\{', entry)
            if not pm:
                return ""
            pstart = pm.end() - 1
            pend = bracket_scan(entry, pstart)
            obj_text = entry[pstart:pend]
            fm = re.search(field_name + r':\s*`', obj_text)
            if not fm:
                return ""
            body, _ = find_tpl_body(obj_text, fm.end() - 1)
            return body

        tasks_m = re.search(r"tasks:\s*\[([^\]]*)\]", entry)
        tasks = re.findall(r'"([^"]*)"', tasks_m.group(1)) if tasks_m else []

        # serve blocks（复用现有逻辑）
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

        # perf columns + rows（data.js 中的静态回退数据）
        perf_cols = []
        perf_rows = []
        perf_m = re.search(r"perf:\s*\{", entry)
        if perf_m:
            pstart = perf_m.end() - 1
            pend = bracket_scan(entry, pstart)
            perf_text = entry[pstart:pend]
            cols_m = re.search(r"columns:\s*\[", perf_text)
            if cols_m:
                perf_cols, _ = js_array(perf_text, cols_m.end() - 1)
            rows_m = re.search(r"rows:\s*\[", perf_text)
            if rows_m:
                perf_rows, _ = js_array(perf_text, rows_m.end() - 1)

        # refs
        refs = []
        refs_m = re.search(r"refs:\s*\[", entry)
        if refs_m:
            refs, _ = js_obj_array(entry, refs_m.end() - 1)

        # npu 字段可能是布尔值
        npu_val = field("npu")
        # 尝试解析布尔值
        npu_bool_m = re.search(r'npu:\s*(true|false|"unverified"|"[^"]*")', entry)
        if npu_bool_m:
            raw = npu_bool_m.group(1)
            if raw == "true":
                npu_val = True
            elif raw == "false":
                npu_val = False
            elif raw == '"unverified"':
                npu_val = "unverified"

        models.append({
            "id": model_id,
            "name": field("name"),
            "seriesName": field("seriesName"),
            "org": field("org"),
            "hfRepo": field("hfRepo"),
            "msRepo": field("msRepo"),
            "tasks": tasks,
            "params": field("params"),
            "paramsDetail": field("paramsDetail"),
            "npu": npu_val,
            "npuNote": field("npuNote"),
            "summary": field("summary"),
            "intro": tpl_field("intro"),
            "archText": nested_tpl_field("arch", "text"),
            "blocks": blocks,
            "perfColumns": perf_cols,
            "perfRows": perf_rows,
            "refs": refs,
        })
    return models


# ──────────── 文件生成 ────────────

def render_deploy_sh(model):
    """生成 deploy.sh（与现有 render_sh 一致）。"""
    lines = []
    lines.append("#!/usr/bin/env bash")
    lines.append("# ============================================================")
    lines.append(f"# {model['name']} —— 部署推理脚本")
    lines.append(f"# 系列: {model['seriesName']} ｜ 组织: {model['org']} ｜ 仓库: {model['hfRepo']}")
    lines.append(f"# 任务: {' / '.join(model['tasks'])}")
    lines.append("# 由 generate_models.py 从 assets/js/data.js 自动生成；")
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


def npu_status_label(model):
    """NPU 支持状态文本。"""
    def wrap(note):
        if not note:
            return ""
        return note if note.startswith("（") else f"（{note}）"
    if model["npu"] is True:
        return "是" + wrap(model["npuNote"])
    elif model["npu"] == "unverified":
        return "待验证" + wrap(model["npuNote"])
    else:
        return "暂不支持" + wrap(model["npuNote"])


def weight_links(model):
    """模型权重链接：HuggingFace 为主，ModelScope 镜像为辅（HF 访问不到时用）。"""
    hf = f"[HuggingFace](https://huggingface.co/{model['hfRepo']})"
    if model.get("msRepo"):
        return hf + f" · [ModelScope](https://modelscope.cn/models/{model['msRepo']})"
    return hf


def render_readme_md(model):
    """生成 README.md。"""
    lines = []
    lines.append(f"# {model['name']}")
    lines.append("")
    lines.append("| 项目 | 信息 |")
    lines.append("| --- | --- |")
    lines.append(f"| 系列 | {model['seriesName']} |")
    lines.append(f"| 组织 | {model['org']} |")
    lines.append(f"| 任务 | {' / '.join(model['tasks'])} |")
    lines.append(f"| 模型参数量 | {model['paramsDetail'] or model['params']} |")
    lines.append(f"| NPU 支持 | {npu_status_label(model)} |")
    lines.append(f"| 模型权重 | {weight_links(model)} |")
    lines.append("")

    if model["intro"]:
        lines.append("## 模型介绍")
        lines.append("")
        lines.append(html_to_md(model["intro"]))
        lines.append("")

    if model["archText"]:
        lines.append("## 模型结构")
        lines.append("")
        lines.append(html_to_md(model["archText"]))
        lines.append("")

    if model["refs"]:
        lines.append("## 参考资料")
        lines.append("")
        for r in model["refs"]:
            lines.append(f"- [{r['label']}]({r['url']})")
        lines.append("")

    return "\n".join(lines) + "\n"


def load_old_perf():
    """读取旧 perf-data.json。"""
    if not os.path.exists(OLD_PERF_FILE):
        return {}
    try:
        with open(OLD_PERF_FILE, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def render_perf_json(model, old_perf, existing_rows=None):
    """生成 perf.json。

    行数据优先级：现有 perf.json 非空行（fill_results.py 追加）> 旧 perf-data.json >
    data.js 的 perf.rows（静态回退数据）> 空。
    """
    if existing_rows is not None:
        rows = existing_rows
    else:
        rows = old_perf.get(model["id"], model["perfRows"])
    return json.dumps({
        "columns": model["perfColumns"],
        "rows": rows,
    }, ensure_ascii=False, indent=2) + "\n"


# ──────────── 主流程 ────────────

def main():
    ap = argparse.ArgumentParser(description="生成 models/<模型id>/ 三件套")
    ap.add_argument("--check", action="store_true", help="只检查与现有文件是否一致，不写盘")
    ap.add_argument("--only", default="", help="只处理指定模型 id（逗号分隔）")
    ap.add_argument("--force", action="store_true", help="强制覆盖被手改过的 deploy.sh")
    args = ap.parse_args()

    models = parse_models()
    if args.only:
        only = {x.strip() for x in args.only.split(",") if x.strip()}
        models = [m for m in models if m["id"] in only]
    model_ids = {m["id"] for m in models}
    old_perf = load_old_perf()

    changed = 0

    for model in models:
        model_dir = os.path.join(MODELS_DIR, model["id"])
        os.makedirs(model_dir, exist_ok=True)

        # deploy.sh
        sh_content = render_deploy_sh(model)
        sh_path = os.path.join(model_dir, "deploy.sh")
        if args.check:
            if not os.path.exists(sh_path) or open(sh_path, encoding="utf-8").read() != sh_content:
                print(f"[check] 不一致: {sh_path}")
                changed += 1
        else:
            if os.path.exists(sh_path) and not args.force:
                existing = open(sh_path, encoding="utf-8").read()
                if existing != sh_content:
                    print(f"[跳过] {model['id']}/deploy.sh 与 data.js 不一致（可能被手改），"+
                          "未覆盖；如需强制覆盖请加 --force")
                else:
                    with open(sh_path, "w", encoding="utf-8") as f:
                        f.write(sh_content)
                    os.chmod(sh_path, 0o755)
            else:
                with open(sh_path, "w", encoding="utf-8") as f:
                    f.write(sh_content)
                os.chmod(sh_path, 0o755)

        # README.md
        md_content = render_readme_md(model)
        md_path = os.path.join(model_dir, "README.md")
        if args.check:
            if not os.path.exists(md_path) or open(md_path, encoding="utf-8").read() != md_content:
                print(f"[check] 不一致: {md_path}")
                changed += 1
        else:
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_content)

        # perf.json
        perf_path = os.path.join(model_dir, "perf.json")
        existing_rows = None
        if os.path.exists(perf_path):
            try:
                with open(perf_path, encoding="utf-8") as f:
                    loaded_rows = json.load(f).get("rows", [])
                if isinstance(loaded_rows, list) and loaded_rows:
                    existing_rows = loaded_rows  # 仅非空行保留，空则回退到 data.js
            except (OSError, ValueError):
                existing_rows = None
        perf_content = render_perf_json(model, old_perf, existing_rows)
        if args.check:
            if not os.path.exists(perf_path) or open(perf_path, encoding="utf-8").read() != perf_content:
                print(f"[check] 不一致: {perf_path}")
                changed += 1
        else:
            with open(perf_path, "w", encoding="utf-8") as f:
                f.write(perf_content)

    # 孤儿清理
    if not args.only and os.path.isdir(MODELS_DIR):
        for name in sorted(os.listdir(MODELS_DIR)):
            if name not in model_ids:
                path = os.path.join(MODELS_DIR, name)
                if os.path.isdir(path):
                    if args.check:
                        print(f"[check] 孤儿目录（data.js 中已无此模型）: {path}")
                        changed += 1
                    else:
                        shutil.rmtree(path)
                        print(f"已删除孤儿目录: {name}")

    if args.check:
        print(f"检查完成: {len(models)} 个模型" + (f"，{changed} 个不一致" if changed else "，全部一致"))
        if changed:
            sys.exit(1)
    else:
        print(f"生成完成: {len(models)} 个模型 -> {MODELS_DIR}/")

    # 提示：迁移后 scripts/ 和 perf-data.json 需要手动删除
    if not args.check and not args.only:
        if os.path.exists(OLD_SCRIPTS_DIR):
            print(f"提示: 旧 scripts/ 目录仍存在，确认无误后可手动删除: rm -rf {OLD_SCRIPTS_DIR}")
        if os.path.exists(OLD_PERF_FILE):
            print(f"提示: 旧 perf-data.json 仍存在，确认无误后可手动删除: rm {OLD_PERF_FILE}")


if __name__ == "__main__":
    main()
