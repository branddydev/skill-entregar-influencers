#!/usr/bin/env python3
"""verificar_publicada.py — comprueba que una fila del Catálogo está live en l.influencerviral.io.

Uso:
    python verificar_publicada.py <page_id>

page_id con o sin guiones.

⚠️ Notion Sites responde **200 para cualquier id**, exista o no, y el título/nombre NO está en el HTML
(se renderiza en cliente). El marcador fiable es que el HTML contenga el propio page_id (con o sin guiones):
solo aparece cuando la página está publicada en ese dominio.

Salida: JSON {"url":..., "status":..., "live": true/false, "id_in_html": true/false}. Exit 0 si live, 1 si no.
Solo stdlib (urllib), portable.
"""
import json
import sys
import urllib.request
import urllib.error

DOMAIN = "https://l.influencerviral.io/"


def dashed(pid32: str) -> str:
    return f"{pid32[0:8]}-{pid32[8:12]}-{pid32[12:16]}-{pid32[16:20]}-{pid32[20:32]}"


def check(page_id: str) -> dict:
    pid = page_id.replace("-", "").strip().lower()
    url = DOMAIN + pid
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            status = r.status
            html = r.read().decode("utf-8", "ignore").lower()
    except urllib.error.HTTPError as e:
        status, html = e.code, ""
    except Exception as e:  # red, DNS, timeout
        return {"url": url, "status": None, "live": False, "id_in_html": False, "error": str(e)}
    id_in_html = (pid in html) or (dashed(pid) in html)
    live = status == 200 and id_in_html
    return {"url": url, "status": status, "live": live, "id_in_html": id_in_html}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    res = check(sys.argv[1])
    print(json.dumps(res, ensure_ascii=False))
    sys.exit(0 if res["live"] else 1)
