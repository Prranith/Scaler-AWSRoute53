"""BIND zone file parser for importing DNS records."""

import re
from typing import Any

SUPPORTED_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"}

# Match lines like: name [ttl] [class] type rdata
RECORD_RE = re.compile(
    r"^(?P<name>\S+)\s+(?:(?P<ttl>\d+)\s+)?(?:IN\s+)?(?P<type>[A-Z]+)\s+(?P<rdata>.+)$",
    re.IGNORECASE,
)


def split_line_comment(line: str) -> tuple[str, str | None]:
    """Split a line into (record_part, comment_part) handling quotes."""
    in_quotes = False
    quote_char = None
    for i, char in enumerate(line):
        if char in ('"', "'"):
            if not in_quotes:
                in_quotes = True
                quote_char = char
            elif quote_char == char:
                # check if escaped
                escaped = False
                j = i - 1
                while j >= 0 and line[j] == '\\':
                    escaped = not escaped
                    j -= 1
                if not escaped:
                    in_quotes = False
                    quote_char = None
        elif char == ';' and not in_quotes:
            return line[:i].rstrip(), line[i+1:].strip()
    return line, None


def parse_bind_zone(content: str) -> list[dict[str, Any]]:
    """Parse a BIND zone file and return a list of record dicts suitable for DNSRecordCreate."""
    records: list[dict[str, Any]] = []
    default_ttl = 300
    last_name = None

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith(";"):
            continue
        if line.upper().startswith("$TTL"):
            parts = line.split()
            if len(parts) >= 2:
                try:
                    default_ttl = int(parts[1])
                except ValueError:
                    pass
            continue
        if line.upper().startswith("$ORIGIN") or line.upper().startswith("$"):
            continue

        # Split comment from the line
        record_part, comment = split_line_comment(line)
        record_part = record_part.strip()
        if not record_part:
            continue

        m = RECORD_RE.match(record_part)
        if not m:
            continue

        name = m.group("name")
        if name == "@":
            name = "@"
        if name and not name.startswith(";"):
            last_name = name
        elif not name:
            name = last_name or "@"

        rec_type = m.group("type").upper()
        if rec_type not in SUPPORTED_TYPES:
            continue

        ttl = int(m.group("ttl")) if m.group("ttl") else default_ttl
        rdata = m.group("rdata").strip()

        priority = None
        if rec_type in ("MX", "SRV"):
            parts = rdata.split(None, 1)
            if len(parts) == 2 and parts[0].isdigit():
                priority = int(parts[0])
                rdata = parts[1]

        records.append({
            "name": name,
            "type": rec_type,
            "ttl": ttl,
            "value": [rdata],
            "priority": priority,
            "comment": comment,
        })

    return records
