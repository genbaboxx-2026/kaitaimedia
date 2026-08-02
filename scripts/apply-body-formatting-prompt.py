#!/usr/bin/env python3
"""Apply body/fix prompt updates for article formatting (one-shot)."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

NOTE = "本文に太字・マーカー・コールアウト体裁を必須化"

BODY_CONTENT = """あなたは解体業界の専門メディアのライターです。以下の見出し構成に沿って本文をMarkdownで書いてください。

見出し構成: {{structure}}
記事型: {{article_type}}
文体: {{writing_style}}
専門用語のレベル: {{expertise_level}}
文字数: {{min_char_count}}〜{{max_char_count}}字
禁止表現: {{ng_expressions}}
推奨表現: {{recommended_expressions}}
参照マスタ: {{masters}}
FAQ: {{faq_section}}

最重要の制約（違反厳禁）:
- 金額（円・万円）、重量・容積（t・kg・m³）、単価（円/t 等）、割合（%・割）、断定的な工期日数を一切書かない。
- 数量は読者が自分の現場の値を入れる前提で、計算式・考え方・確認項目として示す。
- 事実と異なる数値を創作しない。不確かな数値は書かない。
- 禁止表現（{{ng_expressions}}）は使わない。
- 本文に http/https のURLや外部リンクを書かない。法令・制度は名称と概要のみで示す（読者が公式サイトで確認できるよう案内する程度にとどめる）。

体裁（必ず守る・読みやすさのため）:
- 大見出しは ## 、小見出しは ### のみ。単独の # は使わない。
- 重要な用語・手順の要点は **太字** で強調する（各 ## セクションに2〜5箇所）。
- 特に覚えてほしい一文は ==このように== マーカーで囲む（記事全体で2〜5箇所）。
- 注意点・現場での要点は引用記法（行頭に > ）でコールアウトにする（記事全体で2〜4個）。例:
  > ポイント：足場の点検は作業前に必ず行う。
- 長い段落だけにせず、- の箇条書きを各セクションで使う。
- 出力はMarkdown本文のみ（前置き不要）。"""

FIX_SUFFIX = """

体裁の維持:
- **太字**・==マーカー==・引用（>）によるコールアウト・箇条書きは削らない。読みやすさのために適切に使う。
- 単独の # 見出しは ### に直す。"""


def load_env() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def req(
    method: str,
    path: str,
    *,
    data: dict | list | None = None,
    prefer: str = "return=representation",
) -> list | dict | None:
    base = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    url = f"{base}/rest/v1/{path}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Prefer": prefer,
    }
    body = None
    if data is not None:
        body = json.dumps(data, ensure_ascii=False).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(request) as res:
            raw = res.read()
            if not raw:
                return None
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise SystemExit(f"HTTP {e.code} {path}: {err}") from e


def ensure_body_prompt() -> None:
    note_q = urllib.parse.quote(NOTE)
    existing = req("GET", f"prompts?select=id&step=eq.body&note=eq.{note_q}&limit=1")
    req(
        "PATCH",
        "prompts?step=eq.body&is_active=eq.true",
        data={"is_active": False},
        prefer="return=minimal",
    )
    if existing:
        req(
            "PATCH",
            f"prompts?step=eq.body&note=eq.{note_q}",
            data={"is_active": True},
            prefer="return=minimal",
        )
        print("body: reactivated")
        return
    versions = req(
        "GET", "prompts?select=version&step=eq.body&order=version.desc&limit=1"
    )
    ver = (versions[0]["version"] + 1) if versions else 1
    req(
        "POST",
        "prompts",
        data={
            "step": "body",
            "version": ver,
            "content": BODY_CONTENT,
            "variables": [
                "structure",
                "article_type",
                "writing_style",
                "expertise_level",
                "min_char_count",
                "max_char_count",
                "ng_expressions",
                "recommended_expressions",
                "faq_section",
                "masters",
            ],
            "is_active": True,
            "note": NOTE,
            "created_by": "migration",
        },
        prefer="return=minimal",
    )
    print(f"body: inserted v{ver}")


def ensure_fix_prompt() -> None:
    note_q = urllib.parse.quote(NOTE)
    existing = req("GET", f"prompts?select=id&step=eq.fix&note=eq.{note_q}&limit=1")
    if existing:
        req(
            "PATCH",
            "prompts?step=eq.fix&is_active=eq.true",
            data={"is_active": False},
            prefer="return=minimal",
        )
        req(
            "PATCH",
            f"prompts?step=eq.fix&note=eq.{note_q}",
            data={"is_active": True},
            prefer="return=minimal",
        )
        print("fix: reactivated")
        return
    latest = req(
        "GET",
        "prompts?select=content,variables,version&step=eq.fix&order=version.desc&limit=1",
    )
    if not latest:
        print("fix: skipped (none)")
        return
    row = latest[0]
    req(
        "PATCH",
        "prompts?step=eq.fix&is_active=eq.true",
        data={"is_active": False},
        prefer="return=minimal",
    )
    req(
        "POST",
        "prompts",
        data={
            "step": "fix",
            "version": row["version"] + 1,
            "content": row["content"] + FIX_SUFFIX,
            "variables": row["variables"],
            "is_active": True,
            "note": NOTE,
            "created_by": "migration",
        },
        prefer="return=minimal",
    )
    print(f"fix: inserted v{row['version'] + 1}")


def main() -> None:
    load_env()
    ensure_body_prompt()
    ensure_fix_prompt()
    active = req(
        "GET",
        "prompts?select=step,version,note,is_active&or=(step.eq.body,step.eq.fix)&is_active=eq.true",
    )
    print(json.dumps(active, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
