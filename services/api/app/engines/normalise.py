"""Text normaliser shared by crisis-lexicon patterns and input text (crisis_lexicon.v1.json → normalisation).

Deviation from the draft spec (documented in docs/04-ai/AI_EVALS.md addendum): the Arabizi vowel folding
('ou'->'u', 'ee'->'i', 'oo'->'u') is NOT applied, because the lexicon patterns themselves encode vowel
variants (e.g. ``a3ee?sh``, ``moo?t``); folding the input would make those patterns miss.
"""

from __future__ import annotations

import re
import unicodedata

_DIACRITICS = re.compile("[ً-ْٰـ]")
# Zero-width / invisible format characters (ZWSP, ZWNJ, ZWJ, LRM, RLM, word joiner, BOM, soft hyphen).
# AI_EVALS §7: the normaliser must strip these so "خود<ZWNJ>کشی" or "su<ZWSP>icide" still match.
_ZERO_WIDTH = re.compile("[­​-‏⁠﻿]")
_LETTER_FOLD = str.maketrans(
    {
        "أ": "ا",
        "إ": "ا",
        "آ": "ا",
        "ٱ": "ا",
        "ة": "ه",
        "ى": "ي",
        "ؤ": "و",
        "ئ": "ي",
        # Urdu / Persian folding (matching only)
        "ی": "ي",
        "ک": "ك",
        "ہ": "ه",
        "ھ": "ه",
        "ۓ": "ي",
        "ے": "ي",
        # Eastern Arabic and Urdu digits -> ASCII
        "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
        "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
        "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
        "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    }
)
_REPEATS = re.compile(r"(.)\1{2,}")
_WS = re.compile(r"\s+")


def fold_script(text: str) -> str:
    """Script-level folding only; safe to apply to regex patterns (no case or punctuation changes)."""
    text = unicodedata.normalize("NFKC", text)
    text = _ZERO_WIDTH.sub("", text)
    text = _DIACRITICS.sub("", text)
    return text.translate(_LETTER_FOLD)


def normalise(text: str) -> str:
    """Full normalisation for input text."""
    text = fold_script(text).lower()
    text = text.replace("’", "'").replace("‘", "'")
    text = "".join(
        " " if unicodedata.category(ch).startswith("P") and ch != "'" else ch for ch in text
    )
    text = _REPEATS.sub(r"\1\1", text)
    return _WS.sub(" ", text).strip()
