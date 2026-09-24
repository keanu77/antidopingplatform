#!/usr/bin/env python3
"""Read-only source screening and official-list inventory; never edits published data."""
import collections
import csv
import hashlib
import json
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
EXPECTED_CASES_SHA256 = 'a2b569c398bd0592522a008b67bcb3525de8e5192cca96378ec43a00e1401da6'
EXPECTED_SOURCE_SHA256 = {
    'USADA': 'bafa8a6ac723fa897574dc1845b3b7ffdd3fa912c24c9c8aafa7f46cd7f2cead',
    'ITA': 'cfe1e72e0637b09dd3d640fe3eb94eb99e497bc71020a59d5c4799b271b46dae',
}

class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables, self.table, self.row, self.cell = [], None, None, None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'table': self.table = []
        if tag == 'tr' and self.table is not None: self.row = {'cells': [], 'links': [], 'attrs': attrs}
        if tag in ('td', 'th') and self.row is not None: self.cell = []
        if tag == 'a' and self.row is not None and attrs.get('href'): self.row['links'].append(attrs['href'])
    def handle_data(self, data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            self.row['cells'].append(' '.join(' '.join(self.cell).split()))
            self.cell = None
        if tag == 'tr' and self.row is not None:
            self.table.append(self.row)
            self.row = None
        if tag == 'table' and self.table is not None:
            self.tables.append(self.table)
            self.table = None

def norm(name):
    name = re.sub(r'\([^)]*\)|（[^）]*）', '', name)
    name = unicodedata.normalize('NFKD', name).casefold()
    name = ''.join(c for c in name if not unicodedata.combining(c))
    return ' '.join(sorted(re.findall(r'[a-z0-9]+', name)))

def excluded_country(country):
    return country.strip().casefold() in {'taiwan', 'chinese taipei', 'tpe', 'twn', '台灣', '臺灣', '中華台北'}

def writecsv(name, rows):
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

cases_path = ROOT / 'data/cases.json'
if hashlib.sha256(cases_path.read_bytes()).hexdigest() != EXPECTED_CASES_SHA256:
    cases_path = ROOT / 'docs/research/2026-09-22-case-corrections-batch-01/baseline-cases.json'
assert hashlib.sha256(cases_path.read_bytes()).hexdigest() == EXPECTED_CASES_SHA256, 'Case data changed: create a new dated audit rather than overwrite this baseline.'
cases = json.loads(cases_path.read_text())
lines = [i + 1 for i, line in enumerate(cases_path.read_text().splitlines()) if re.search(r'^  "id":', line)]
assert len(lines) == len(cases)
current_keys = {norm(c['athleteName']) for c in cases}
findings_path = OUT / 'findings.json'
findings = json.loads(findings_path.read_text()) if findings_path.exists() else []
reviewed = {f['id']: f for f in findings}
rows = []
for case, line in zip(cases, lines):
    flags = ['缺個案專屬來源']
    if 'TUE' in case['punishment']['banDuration']: flags.append('TUE或合法用藥須分區')
    if re.search(r'疑似|指控', case['substance']): flags.append('指控或疑似須核實')
    if re.search(r'隊|系統|群體|System', case['athleteName']): flags.append('集體事件非單人案件')
    if case['sport'] in ('化學家', '科學支援'): flags.append('支援人員非運動項目')
    if case['id'] in ('134', '135'): flags.append('同事件重複候選')
    finding = reviewed.get(case['id'])
    rows.append({'id': case['id'], 'name': case['athleteName'], 'year': case['year'],
        'sport': case['sport'], 'source_line': line, 'flags': '; '.join(flags),
        'status': finding['status'] if finding else '無法查證需人工確認',
        'status_scope': finding['assessment'] if finding else '僅結構初篩，尚未逐案外查；不代表內容為假',
        'urls': ' | '.join(s['url'] for s in case['sourceLinks'])})
writecsv('current-171-screening.csv', rows)
urls = [s['url'] for c in cases for s in c['sourceLinks']]
summary = {'current': {'records': len(cases), 'year_min': min(c['year'] for c in cases),
    'year_max': max(c['year'] for c in cases), 'source_links': len(urls), 'unique_source_urls': len(set(urls)),
    'homepage_links': sum(not urlparse(u).path.strip('/') for u in urls),
    'no_case_specific_source': len(cases),
    'old_random_generator_fingerprint_matches': sum(bool(re.fullmatch(r'\d{4}年.+期間藥檢呈陽性反應，違反了反禁藥規則。', c['eventBackground'].strip())) for c in cases),
    'generic_background_count': sum('年期間，' in c['eventBackground'] and '成為近年重要的禁藥案例' in c['eventBackground'] for c in cases),
    'flags_nonexclusive': dict(collections.Counter(flag for r in rows for flag in r['flags'].split('; '))),
    'targeted_review_records': len(findings),
    'targeted_review_statuses': dict(collections.Counter(f['status'] for f in findings)),
    'source_commit': '60f7073a9deb98af0b117735717250e638bee9ba',
    'taiwan_labeled_records': sum(excluded_country(c['nationality']) for c in cases),
    'cases_sha256': hashlib.sha256(cases_path.read_bytes()).hexdigest()}, 'sources': {}}
candidates = []
for source, filename, url in [
    ('USADA', 'usada-sanctions', 'https://www.usada.org/results/sanctions/'),
    ('ITA', 'ita-adrv', 'https://ita.sport/anti-doping-rule-violations/'),
]:
    path = Path(f'/private/tmp/antidoping-{filename}-20260922.html')
    assert hashlib.sha256(path.read_bytes()).hexdigest() == EXPECTED_SOURCE_SHA256[source], 'Source snapshot changed: create a new dated audit.'
    parser = Tables()
    parser.feed(path.read_text())
    table = parser.tables[0]
    source_rows = []
    for i, row in enumerate(table):
        cols = row['cells']
        if source == 'USADA':
            if i == 0: continue
            assert len(cols) == 5
            name, sport, substance, sanction, announced = cols
            status = 'announced'
            country = ''  # USADA's list does not state nationality; never infer it from the agency.
            person_type = 'not separately classified in source table'
            links = [urljoin(url, link) for link in row['links']]
            named = 'name removed' not in name.lower()
            selected = named and bool(links)
        else:
            if 'sanction' not in row['attrs'].get('class', '').split(): continue
            assert len(cols) == 6
            name, country, sport, sanction, status, _ = cols
            detail = table[i + 1]
            links = [urljoin(url, link) for link in detail['links']]
            details = ' '.join(detail['cells'])
            person_type = re.search(r'Individual Type (.*?) ADRV', details).group(1)
            named = bool(name) and not re.search(r'anonym|redact|minor|protected|removed', name, re.I)
            selected = named and status.lower() == 'resolved' and bool(links)
        record = {'source': source, 'name': name, 'sport': sport, 'person_type': person_type,
            'country_as_listed': country,
            'taiwan_excluded': excluded_country(country),
            'nationality_review': 'excluded' if excluded_country(country) else ('source_lists_other_country' if country and country != 'N/A' else 'pending_individual_verification'),
            'sanction': sanction, 'source_status': status, 'decision_url': ' | '.join(links),
            'named': named, 'resolved_or_announced_with_link': selected,
            'name_key': norm(name), 'name_matches_existing': norm(name) in current_keys,
            'publication_approved': False}
        source_rows.append(record)
    candidates.extend(source_rows)
    selected_rows = [r for r in source_rows if r['resolved_or_announced_with_link']]
    summary['sources'][source] = {'url': url, 'retrieved_date': '2026-09-22',
        'snapshot_sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'rows': len(source_rows),
        'named_rows': sum(r['named'] for r in source_rows),
        'unique_named_name_keys': len({r['name_key'] for r in source_rows if r['named']}),
        'statuses': dict(collections.Counter(r['source_status'] for r in source_rows)),
        'individual_types': dict(collections.Counter(r['person_type'] for r in source_rows)),
        'resolved_or_announced_with_link_rows': len(selected_rows),
        'resolved_or_announced_with_link_unique_name_keys': len({r['name_key'] for r in selected_rows}),
        'selected_name_keys_matching_existing': len({r['name_key'] for r in selected_rows if r['name_matches_existing']})}
selected = [r for r in candidates if r['resolved_or_announced_with_link'] and not r['taiwan_excluded']]
keys = {r['name_key'] for r in selected}
summary['combined'] = {'selected_rows': len(selected), 'unique_name_keys': len(keys),
    'name_keys_matching_existing': len(keys & current_keys),
    'candidate_new_name_keys': len(keys - current_keys),
    'known_taiwan_rows_excluded_all_statuses': sum(r['taiwan_excluded'] for r in candidates),
    'known_taiwan_rows_excluded_with_link': sum(r['taiwan_excluded'] and r['resolved_or_announced_with_link'] for r in candidates),
    'new_name_keys_with_other_country_in_source': len({r['name_key'] for r in selected if not r['name_matches_existing'] and r['nationality_review'] == 'source_lists_other_country'}),
    'new_name_keys_requiring_nationality_check': len((keys - current_keys) - {r['name_key'] for r in selected if r['nationality_review'] == 'source_lists_other_country'}),
    'deduplication_limit': 'Sorted accent-stripped ASCII name tokens only; not verified identity/event deduplication. USADA may include support personnel. ITA resolved status is a screening field, not independent appeal-status review.'}
broad = [r for r in candidates if r['named'] and not r['taiwan_excluded'] and (r['source'] == 'USADA' or r['source_status'].lower() == 'resolved')]
broad_keys = {r['name_key'] for r in broad}
summary['broader_pool_including_ita_without_individual_link'] = {
    'rows': len(broad), 'unique_name_keys': len(broad_keys),
    'candidate_new_name_keys': len(broad_keys - current_keys),
    'warning': 'Not additive to combined pool. Individual decision links are missing for some ITA rows.'}
writecsv('official-source-candidates.csv', [r for r in candidates if not r['taiwan_excluded']])
writecsv('new-candidates-with-links.csv', [r for r in selected if not r['name_matches_existing']])
(OUT / 'inventory-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary, ensure_ascii=False, indent=2))
