#!/usr/bin/env python3
"""
Price Watcher — surveille une page web et notifie quand un prix change.

Compétences illustrées :
- requêtes HTTP avec retries/backoff (stdlib urllib uniquement)
- parsing HTML léger (regex ciblées, sans dépendance BeautifulSoup)
- état persistant en JSON (comparer "hier" vs "aujourd'hui")
- notifications : console + webhook configurable (Slack/Discord/ntfy)
- utilisable en cron pour une veille automatique

Usage :
    python3 watcher.py https://exemple.com/produit
    python3 watcher.py https://exemple.com/produit --webhook https://hooks.slack.com/...

⚠️ Respectez les conditions d'utilisation et le robots.txt des sites ciblés.
"""

import argparse
import json
import logging
import re
import sys
import time
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

STATE_FILE = Path(__file__).parent / "watch_state.json"
USER_AGENT = "MiniPriceWatcher/1.0 (projet de démonstration ; usage personnel)"

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("watcher")


class TextExtractor(HTMLParser):
    """Extrait le texte visible d'une page (sans scripts/styles)."""

    def __init__(self):
        super().__init__()
        self.chunks: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self._skip += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style"} and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if not self._skip and data.strip():
            self.chunks.append(data.strip())


def fetch(url: str, retries: int = 3, backoff: float = 2.0) -> str:
    """Récupère une page avec politique de retries exponentielle."""
    last_err: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=15) as resp:
                charset = resp.headers.get_content_charset() or "utf-8"
                return resp.read().decode(charset, errors="replace")
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = e
            wait = backoff ** attempt
            log.warning("Tentative %d/%d échouée (%s), nouvelle tentative dans %.0fs…",
                        attempt, retries, e, wait)
            time.sleep(wait)
    raise RuntimeError(f"Impossible de récupérer {url} après {retries} tentatives : {last_err}")


def extract_prices(html: str) -> list[str]:
    """Retourne les montants trouvés sur la page (ex. '12,99 €', '€ 34.50', '$19')."""
    text = _page_text(html)
    pattern = re.compile(
        r"(?:[$€£]\s?\d+(?:[.,]\d{1,2})?)|(?:(?:\d+(?:[.,]\d{1,2})?)\s?(?:[$€£]|EUR|USD))",
        re.IGNORECASE,
    )
    return sorted(set(m.group().strip() for m in pattern.finditer(text)))


def _page_text(html: str) -> str:
    parser = TextExtractor()
    parser.feed(html)
    return " ".join(parser.chunks)


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def notify(message: str, webhook: str | None) -> None:
    log.info("🔔 %s", message)
    if webhook:
        payload = json.dumps({"text": message}).encode()
        req = urllib.request.Request(
            webhook, data=payload,
            headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
        )
        try:
            urllib.request.urlopen(req, timeout=10)
            log.info("Webhook envoyé.")
        except urllib.error.URLError as e:
            log.error("Échec du webhook : %s", e)


def main() -> None:
    ap = argparse.ArgumentParser(description="Surveille un prix sur une page web.")
    ap.add_argument("url", help="URL à surveiller")
    ap.add_argument("--webhook", help="URL de webhook (Slack, Discord, ntfy…)")
    ap.add_argument("--reset", action="store_true", help="Oublier l'état mémorisé")
    args = ap.parse_args()

    state = load_state()
    if args.reset:
        state.pop(args.url, None)
        save_state(state)
        log.info("État réinitialisé pour %s", args.url)
        return

    log.info("🌐 Analyse de %s", args.url)
    try:
        html = fetch(args.url)
    except RuntimeError as e:
        log.error("%s", e)
        sys.exit(1)

    prices = extract_prices(html)
    if not prices:
        log.warning("Aucun prix détecté sur cette page.")
        return

    previous = state.get(args.url, {}).get("prices")
    log.info("Prix détectés : %s", ", ".join(prices))

    if previous is None:
        log.info("ℹ️  Première exécution — référence mémorisée, aucune alerte.")
    elif prices != previous:
        notify(f"Prix changé sur {args.url} : {' ,'.join(previous)} → {' ,'.join(prices)}",
               args.webhook)

    state[args.url] = {"prices": prices, "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S")}
    save_state(state)


if __name__ == "__main__":
    main()
