#!/usr/bin/env python3
"""Build factual case summaries from a frozen official-register review.

No network requests. Register review is deliberately distinct from reading an
individual announcement or a complete judgment. Selection and exclusions are
written out for review; this script does not change the legacy source archive.
"""
import collections
import csv
import hashlib
import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BATCH = ROOT / 'docs/research/2026-09-22-case-corrections-batch-01'
OUT = ROOT / 'docs/research/2026-09-22-expansion-500'
ITA_URL = 'https://ita.sport/anti-doping-rule-violations/'
AIU_URL = 'https://www.athleticsintegrity.org/disciplinary-process/first-instance-decisions'
DATE = '2026-09-22'
NEW_CASE_TARGET = 500

def read(path):
    return json.loads(path.read_text())

def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def key(s):
    s = re.sub(r'\([^)]*\)|（[^）]*）', '', s)
    s = ''.join(c for c in unicodedata.normalize('NFKD', s).lower() if not unicodedata.combining(c))
    return ' '.join(sorted(re.findall(r'[a-z0-9]+', s)))

def display_name(s):
    if ',' in s:
        last, first = s.split(',', 1)
        return (first.strip() + ' ' + last.strip()).strip()
    return s

COUNTRIES = {}
for line in '''Italy|義大利|ITA
United States|美國|USA|United States of America
United Kingdom|英國|Great Britain|England|Scotland
Morocco|摩洛哥|MAR
Kazakhstan|哈薩克|KAZ
Bulgaria|保加利亞
Kyrgyzstan|吉爾吉斯
Mongolia|蒙古|Mongolian|MGL
Tunisia|突尼西亞
Saudi Arabia|沙烏地阿拉伯|KSA
Venezuela|委內瑞拉
Nigeria|奈及利亞|NGR
China|中國|CHN
Mexico|墨西哥|MEX
India|印度|IND
Türkiye|土耳其|Turkey
Russia|俄羅斯|Russian Federation|Russan Federation|RUS
Uzbekistan|烏茲別克|UZB
Turkmenistan|土庫曼
Azerbaijan|亞塞拜然
Brazil|巴西|Brasil|BRA
Colombia|哥倫比亞
Georgia|喬治亞|GEO
Vietnam|越南|Viet Nam
Ecuador|厄瓜多
France|法國
Cuba|古巴
Spain|西班牙|ESP
Ukraine|烏克蘭|UKR
Portugal|葡萄牙
Peru|秘魯
Switzerland|瑞士
Australia|澳洲
Netherlands|荷蘭|Netherland
South Africa|南非|RSA
Algeria|阿爾及利亞
Puerto Rico|波多黎各
Poland|波蘭
Egypt|埃及
Serbia|塞爾維亞
Czech Republic|捷克|Czech Repuclic
Iran|伊朗|Islamic Republic of Iran|Iran - Islamic Republic of Iran|Iran - Islamic Republic of
Belarus|白俄羅斯|BLR
Iraq|伊拉克|IRQ
Germany|德國
Philippines|菲律賓
Bahrain|巴林|BRN
Croatia|克羅埃西亞|CRO
Costa Rica|哥斯大黎加
Montenegro|蒙特內哥羅
Afghanistan|阿富汗
Pakistan|巴基斯坦
Romania|羅馬尼亞
Sweden|瑞典
El Salvador|薩爾瓦多
Republic of Korea|韓國
Argentina|阿根廷|ARG
Moldova|摩爾多瓦|Republic of Moldova
Thailand|泰國
Mauritius|模里西斯
Greece|希臘
Albania|阿爾巴尼亞|ALB
Kuwait|科威特
Syria|敘利亞|Syrian Arab Republic
Paraguay|巴拉圭
Hungary|匈牙利
Kosovo|科索沃
Barbados|巴貝多
Uruguay|烏拉圭
United Arab Emirates|阿拉伯聯合大公國
Austria|奧地利
Canada|加拿大|CAN
Israel|以色列
Angola|安哥拉
Qatar|卡達
Cameroon|喀麥隆
Bolivia|玻利維亞|BOL
Democratic Republic of Congo|剛果民主共和國|Democratic Republic of the Congo|COD
Republic of Congo|剛果共和國|Congo
Honduras|宏都拉斯
Dominican Republic|多明尼加
Tajikistan|塔吉克
Norway|挪威
Lithuania|立陶宛
Slovakia|斯洛伐克
Chile|智利|CHI
Niger|尼日
Bahamas|巴哈馬
Lebanon|黎巴嫩
Guam|關島
Panama|巴拿馬
Nepal|尼泊爾
Djibouti|吉布地
Ireland|愛爾蘭
Nicaragua|尼加拉瓜
Seychelles|塞席爾
Ghana|迦納
Palestine|巴勒斯坦
Jamaica|牙買加|JAM
Kenya|肯亞|KEN
Belgium|比利時
Guatemala|瓜地馬拉
Jordan|約旦
Ethiopia|衣索比亞|ETH
Eritrea|厄利垂亞|ERI
Tanzania|坦尚尼亞|TAN
Uganda|烏干達|UGA
Suriname|蘇利南|SUR
Japan|日本|JPN'''.splitlines():
    parts = line.split('|')
    for alias in [parts[0], *parts[2:]]:
        COUNTRIES[alias] = parts[1]

SPORTS = dict(line.split('|') for line in '''Weightlifting|舉重
Bodybuilding|健美
Cycling|自行車
Cícling|自行車
Wrestling|角力
Boxing|拳擊
Mixed Martial Arts|綜合格鬥
Baseball|棒球
Sambo|桑搏
Judo|柔道
Kurash|庫拉什
Taekwondo|跆拳道
Wushu|武術
Canoe|輕艇
Rowing|划船
Swimming|游泳
Kickboxing|踢拳
Ironman|鐵人三項
Athletics|田徑
Track and Field|田徑
Triathlon|鐵人三項
Muaythai|泰拳
Handball|手球
Softball|壘球
Ju-Jitsu|柔術
Archery|射箭
Gymnastics|體操
Bobsleigh|雪車
Karate|空手道
Kabaddi|卡巴迪
Military Judo|柔道
Surfing|衝浪
Aquatics|水上運動
Open Water Swimming|公開水域游泳
Grappling|寢技格鬥
Basketball|籃球
Ski Mountaineering|登山滑雪
Luge|雪橇
Waterpolo|水球
Sport Fishing|競技釣魚
Breaking|霹靂舞
Golf|高爾夫
Diving|跳水
Sport Climbing|運動攀登
Alpine Skiing|高山滑雪
Cross Country Skiing|越野滑雪
Figure Skating|花式滑冰'''.splitlines())

HEADINGS = ['Individual Type', 'ADRV', 'Violation Date', 'Ineligibility', 'Results Management Authority', 'Disqualification', 'Means Of Resolution']
def ita_fields(row):
    text = re.sub(r'\s+READ MORE\s*$', '', row['details']).strip()
    pattern = '^' + ''.join(re.escape(h) + r' (.*?)\s+' for h in HEADINGS[:-1]) + re.escape(HEADINGS[-1]) + r' (.*)$'
    m = re.match(pattern, text)
    if not m:
        raise ValueError('unparsed ITA detail: ' + row['cells'][0])
    return dict(zip(HEADINGS, m.groups()))

def year_in(text):
    years = re.findall(r'\b(?:19|20)\d{2}\b', text)
    return int(years[0]) if years else None

def dates_in(text):
    found = re.findall(r'\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2}\b', text)
    return [datetime.strptime(s, '%d %B %Y').date() for s in found]

def duration(text):
    if re.search(r'life(?:time)? (?:ban|period)', text, re.I):
        return '終身禁賽'
    m = re.search(r'(\d+(?:\.\d+)?) years?(?: and (\d+) months?)?', text, re.I)
    if m:
        return m[1] + '年' + (m[2] + '個月' if m[2] else '')
    m = re.search(r'(\d+) months?', text, re.I)
    if m:
        return m[1] + '個月'
    return None

def period_problem(case):
    """Hold unusual periods for individual review rather than silently repair."""
    o = case['officialRecord']
    if re.search(r'\bto\s*$|\d{4} From', o['disqualification']):
        return '成績取消欄截斷或連接詞矛盾，需個案補查'
    if re.search(r'\b\d{1,2} [A-Z][a-z]+ \d{2}\b', o['disqualification']):
        return '成績取消年份截斷，需個案補查'
    if case['review']['personType'] == 'N/A':
        return '身分類型未列，需個案補查'
    if not case['id'].startswith('ita-') or '終身' in case['punishment']['banDuration']:
        return None
    dates = dates_in(o['ineligibility'])
    if len(dates) != 2:
        return '禁賽起訖欄缺漏或格式錯誤，需個案補查'
    ban = case['punishment']['banDuration']
    years, months = re.search(r'(\d+(?:\.\d+)?)年', ban), re.search(r'(\d+)個月', ban)
    expected = (float(years[1]) * 12 if years else 0) + (float(months[1]) if months else 0)
    if abs((dates[1]-dates[0]).days + 1 - expected*365.2425/12) > 3:
        return '年限與起訖差異或涉及折抵，留待個案審核'
    return None

def rule_type(text):
    t = text.lower()
    if 'whereabout' in t:
        return '行蹤義務違規', 'ADRV 2.4：行蹤義務', '行蹤申報與漏檢屬程序義務；這類違規不等同於樣本檢出禁用物質。'
    if '10.14' in t or 'prohibition' in t:
        return '禁賽期間參與活動', '禁賽期間參與活動規定', '禁賽限制可能涵蓋教練與其他參與方式，不能只理解為禁止正式出賽。'
    if 'tamper' in t or re.search(r'(?:art(?:icle)?s?\.?\s*)2\.5', t):
        return '干擾管制程序', 'ADRV：依個案所載條文', '干擾採樣或結果管理程序可構成獨立違規，應區分各項指控及其結果。'
    if re.search(r'evad|refus|failing to submit', t):
        return '拒絕或規避採樣', 'ADRV 2.3：採樣義務', '採樣義務違規不必以檢出特定藥物為前提；應依個案裁決確認適用條文。'
    if 'abp' in t:
        return '運動員生物護照', 'ADRV 2.2：生物護照證據', '生物護照案件依縱向生物指標及專家評估處理，不能直接改寫成某一藥物的陽性檢驗。'
    if re.search(r'traffick|administration|complicity', t):
        return '其他反禁藥規則違規', 'ADRV：依個案所載條文', '持有、供應、施用及共謀是不同規則項目；本案以官方紀錄列出的條文為準。'
    return '物質或方法相關違規', '年度禁用清單分類未另核對', '違規成立、是否故意及污染來源是不同問題；本紀錄未提供的動機、污染或醫療背景不作推定。'

def official_case(row, source):
    c = row['cells']
    if source == 'ITA':
        name, country, sport, sanction, status = c
        f = ita_fields(row)
        violation, event, period, dq, authority = (f[k] for k in ['ADRV', 'Violation Date', 'Ineligibility', 'Disqualification', 'Results Management Authority'])
        resolution = f['Means Of Resolution']
        year = year_in(event)
        basis = '違規事件年（官方名冊所載）'
        decision = None
    else:
        decision, name, country, violation, sanction, status = c
        sport, authority, resolution = 'Athletics', 'Athletics Integrity Unit / World Athletics', status
        event, period, dq = '名冊未單列違規日期', sanction.split('DQ')[0].strip(' |.'), sanction.split('DQ', 1)[1].strip() if 'DQ' in sanction else 'N/A'
        year = year_in(decision)
        basis = '裁決公布年（事件日期見官方裁決）'
    url = ITA_URL if source == 'ITA' else AIU_URL
    typ, category, note = rule_type(violation)
    ban = duration(sanction)
    person_type = ita_fields(row)['Individual Type'] if source == 'ITA' else ('支援人員' if re.search(r'coach|manager|support personnel', violation, re.I) else '個人（名冊未另列身分）')
    if person_type in ('Athlete Support Personnel', 'Official', '支援人員'):
        typ = '支援人員／' + typ
    country_zh = COUNTRIES[country]
    dq_value = None if dq in ('N/A', '', 'NA') else (False if re.fullmatch(r'None|No disqualification', dq, re.I) else True)
    locator = f'{name} | {country} | ' + (event if source == 'ITA' else decision)
    identity = hashlib.sha256((source + '|' + key(name) + '|' + (event if source == 'ITA' else decision)).encode()).hexdigest()[:12]
    return {
        'id': source.lower() + '-' + identity, 'athleteName': display_name(name), 'year': year,
        'yearBasis': basis, 'sport': SPORTS[sport], 'nationality': country_zh,
        'substance': violation, 'substanceCategory': category,
        'eventBackground': f'{source} 官方名冊列有 {display_name(name)}（{country_zh}）的紀錄。' + (f'違規日期欄：{event}。' if source == 'ITA' else f'裁決日期欄：{decision}。') + f'規則項目：{violation}。',
        'punishment': {'banDuration': ban, 'resultsCancelled': dq_value, 'medalStripped': None,
                       'otherPenalties': f'官方所列禁賽期間：{period}。成績處理：{dq if dq_value is not None else "名冊未載，不推定有或無"}。'},
        'summary': f'{typ}；名冊所列處分為{ban}。處分期間與程序狀態請見本頁官方紀錄。',
        'educationalNotes': note,
        'sourceLinks': [{'title': source + ' 官方個案紀錄：' + locator, 'url': url, 'type': '官方名冊'}],
        'review': {'status': 'registry_checked', 'caseType': typ, 'outcome': f'{ban}；來源狀態：{status}', 'checkedAt': DATE,
                   'scope': '核對官方名冊的姓名、國籍、事件或裁決日期、規則、處分及程序狀態；未逐份審閱裁決全文，未推定故意或污染。' + ('ITA 的 Resolved 不代表所有上訴程序必然結束。' if source == 'ITA' else ''),
                   'sourceLocator': locator, 'nationalitySource': url, 'nationalityAsListed': country, 'personType': person_type},
        'officialRecord': {'authority': authority, 'violation': violation, 'violationDate': event, 'decisionDate': decision,
                           'sanction': sanction, 'ineligibility': period, 'disqualification': dq, 'resolution': resolution, 'status': status,
                           'linkedDocuments': row['links']},
    }

def main():
    # Individual announcement reviews take precedence over registry-only rows.
    ita = read(OUT / 'ita-records.json')['records']
    aiu = read(OUT / 'aiu-first-records.json')['records']
    selection = read(BATCH / 'selection.json')
    reviews = read(BATCH / 'reviews.json')
    individual_path = OUT / 'individual-case-reviews.json'
    individual_reviews = read(individual_path) if individual_path.exists() else []
    individual_by_id = {r['caseId']: r for r in individual_reviews}
    manifest_path = OUT / 'individual-source-manifest.json'
    documents = {r['documentId']:r for r in read(manifest_path)} if manifest_path.exists() else {}
    review_map = {r['batchId']: r for r in reviews}
    first = []
    for s in selection:
        r = review_map[s['batch_id']]
        if r['disposition'] != 'accepted':
            continue
        if s['batch_id'] == 'B01-50':
            case = read(BATCH / 'peter-bol-case.json')
        else:
            matches = [x for x in ita if key(x['cells'][0]) == key(s['name'])]
            assert matches, s['name']
            case = official_case(matches[0], 'ITA')
            case.update(r.get('set', {}))
            # Preserve discrepancies as source transcription, not corrected facts.
            case['registryRecordAsPublished'] = case.pop('officialRecord')
        case['review'].update({'status': 'core_checked', 'caseType': r['caseType'], 'outcome': r['outcome'], 'checkedAt': DATE,
                              'scope': '已閱讀個案官方公告並與目前名冊核對核心事實；未聲稱完整裁決全文已審閱。',
                              'batchId': s['batch_id'], 'auditNotes': r['notes']})
        case['sourceLinks'].insert(0, {'title': '個案官方公告', 'url': s['decision_url'], 'type': '官方公告'})
        for u in r.get('additionalSources', []):
            case['sourceLinks'].append({'title': '補充官方查證', 'url': u, 'type': '官方公告'})
        first.append(case)
    assert len(first) == 50

    corrections = read(ROOT / 'data/case-corrections.json')
    baseline = read(BATCH / 'baseline-cases.json')
    old_by_id = {c['id']: c for c in baseline}
    existing = [{**old_by_id[r['id']], **r['set'], 'id': r['id']} for r in corrections['corrections']]
    existing += corrections['additions']
    assert len(existing) == 17
    # The active goal is 500 NEW cases, not 500 including legacy corrections.
    # Conservatively exclude every baseline person from the new-case count;
    # an independent historical event can be restored later after manual proof.
    baseline_keys = {key(c['athleteName']) for c in baseline}
    assert not baseline_keys.intersection(key(c['athleteName']) for c in first)
    used = baseline_keys | {key(c['athleteName']) for c in first}
    excluded_names = {key(s['name']) for s in selection}  # includes held cases
    # Appeal-page parties are excluded from automatic first-instance selection.
    appeals = read(OUT / 'aiu-appeal-records.json')['records']
    appeal_text = key(' '.join(' '.join(r['cells'][1:3]) for r in appeals))
    alias_keys = {'daniil sapunov': 'danylo sapunov', 'andrade de maicon siqueira': 'andrade de maicon sigueira'}
    used |= {v for k, v in alias_keys.items() if k in used}
    exclusions, candidates = [], []
    for source, rows in [('ITA', ita), ('AIU', aiu)]:
        counts = collections.Counter(key(r['cells'][0 if source == 'ITA' else 1]) for r in rows)
        for index, row in enumerate(rows, 1):
            c = row['cells']
            name, country = (c[0], c[1]) if source == 'ITA' else (c[1], c[2])
            nk = key(name)
            reason = None
            if nk in used or nk in excluded_names: reason = '另有個案審核／待查紀錄，避免重複計數'
            elif counts[nk] > 1: reason = '同名多列，留待事件與身分去重'
            elif country in ('Chinese Taipei', 'Taiwan', 'TPE', 'TWN'): reason = '依收錄政策排除台灣選手'
            elif country not in COUNTRIES: reason = '國籍欄缺漏或不明，不作推定'
            elif re.search(r'anonym|redact|protected|minor|removed', name, re.I): reason = '姓名未公開'
            elif source == 'ITA' and c[4] != 'Resolved': reason = '非 Resolved，不以暫時禁賽充當已處理案件'
            elif source == 'AIU' and not (c[5].startswith('Final ') or c[5] == 'Case Resolution Agreement'): reason = '有未決或可上訴標示，留待個案審查'
            elif source == 'AIU' and 'Integrity Standard' in c[3]: reason = '屬誠信守則案件，非反禁藥違規，排除於本次收錄範圍'
            elif source == 'AIU' and all(t in appeal_text.split() for t in nk.split()): reason = '上訴名冊另有紀錄，留待整合最新結果'
            elif source == 'AIU' and 'Carey McLeod' in name: reason = '名冊個案連結誤指 Alysha Newman，保留待查'
            elif source == 'ITA' and 'Evans, Joanna' in name: reason = '國籍欄 Bahrain 與運動員身分有疑義，需獨立來源補查'
            if not reason:
                try:
                    case = official_case(row, source)
                    if individual_by_id.get(case['id'],{}).get('disposition') == 'held': reason = '逐案文件發現未解決差異：' + individual_by_id[case['id']]['reason']
                    elif not case['year'] or not 1960 <= case['year'] <= 2026: reason = '事件／裁決年份不明'
                    elif not case['punishment']['banDuration']: reason = '處分非單一明確禁賽期間，需個案審核'
                    elif source == 'ITA' and '10.14' in case['substance']: reason = '追加處分需釐清原事件與新違規日期，留待個案審核'
                    elif source == 'ITA' and re.search(r'Presence\s*$', case['substance']): reason = '物質欄缺漏，需個案補查'
                    elif source == 'ITA' and 'Whereabouts' in case['substance'] and case['punishment']['banDuration'] == '4年': reason = '行蹤案件四年處分需補查多次違規或其他理由'
                    elif source == 'ITA' and re.search(r'\+|suspend|reduc|less|credit|additional', c[3], re.I): reason = '合併、折抵或暫緩處分，需個案審核'
                    elif source == 'AIU' and re.search(r'suspend|additional|consecutive|\b1st\b|\b2nd\b', c[4], re.I): reason = '複合處分或緩刑，需個案審核'
                    else:
                        for field in ['ineligibility', 'disqualification']:
                            ds = dates_in(case['officialRecord'][field])
                            if len(ds) == 2 and ds[1] < ds[0]: reason = '官方名冊日期倒置，需個案補查'
                        if source == 'ITA':
                            ds = dates_in(case['officialRecord']['ineligibility'])
                            event_ds = dates_in(case['officialRecord']['violationDate'])
                            if len(ds) == 2 and event_ds and ds[1] < event_ds[0]: reason = '禁賽結束早於違規事件，需個案補查'
                        reason = reason or period_problem(case)
                except (ValueError, KeyError) as e:
                    reason = '欄位無法明確解析：' + str(e)
            if reason:
                exclusions.append({'source': source, 'row': index, 'name': name, 'reason': reason})
            else:
                case['review']['sourceRow'] = index
                candidates.append(case)
                used.add(nk)
    write(OUT / 'selection-exclusions.json', exclusions)
    write(OUT / 'registry-candidates.json', candidates)
    need = NEW_CASE_TARGET - len(first)
    print('Validated registry candidates:', len(candidates), 'needed:', need)
    if len(candidates) < need:
        raise SystemExit('Not enough eligible records; do not weaken gates to meet a count.')
    # Keep every accepted review. Newly reviewed official announcements can replace
    # registry-only candidates; the target is evidence-backed cases, not fixed rows.
    external_path = OUT / 'announcement-reviewed-cases.json'
    external = read(external_path) if external_path.exists() else []
    candidate_names = baseline_keys | {key(c['athleteName']) for c in first + candidates}
    for case in external:
        assert key(case['athleteName']) not in candidate_names, 'External announcement duplicates an existing identity'
        assert individual_by_id.get(case['id'],{}).get('disposition') == 'accepted', 'External cases require individual acceptance'
        assert case['review'].get('nationalitySource') and case['review'].get('nationalityAsListed'), 'External nationality evidence required'
        assert case['nationality'] not in ('台灣','臺灣','中華台北'), 'Taiwan excluded'
        candidate_names.add(key(case['athleteName']))
    accepted = [c for c in candidates if individual_by_id.get(c['id'],{}).get('disposition')=='accepted']
    selected = accepted + external
    assert len(selected) <= need, 'Accepted additions exceed target; reconcile scope explicitly'
    accepted_ids = {c['id'] for c in accepted}
    queues = [collections.deque(c for c in candidates if c['id'].startswith(s) and c['id'] not in accepted_ids) for s in ['ita-', 'aiu-']]
    while len(selected) < need:
        for q in queues:
            if q and len(selected) < need: selected.append(q.popleft())
    # Name + year alone does not prove event identity (e.g. LIMS vs Olympic retest).
    # Only the explicitly reviewed legacy corrections preserve their historical IDs.
    replaced = []
    occupied = {c['id'] for c in existing}
    curated = first + selected
    promoted = 0
    for case in curated:
        review = individual_by_id.get(case['id'])
        if not review or review['disposition'] != 'accepted': continue
        assert key(case['athleteName']) == key(review['expectedName']), 'Individual review identity mismatch'
        for field in ['identity','nationality','event','rule','outcome','period','disqualification','proceduralStatus']:
            assert review['findings'].get(field), f'Missing individual finding: {case["id"]}/{field}'
        sources=[]
        for evidence in review['documents']:
            doc=documents[evidence['documentId']]
            assert doc['status']=='downloaded_unreviewed' and doc['sha256']==evidence['sha256'], 'Evidence snapshot mismatch'
            # Prefer the acquired document over a registry's legacy short link.
            document_url = doc.get('finalUrl') or doc['sourceUrl']
            assert document_url.startswith('https://'), 'Official evidence link must use HTTPS'
            sources.append({'title':evidence['title'],'url':document_url,'type':'官方個案文件'})
        assert sources, 'A download alone never approves a case'
        case['registryRecordAsPublished']=case.pop('officialRecord')
        case.update(review['set'])
        case['sourceLinks'] = sources + case['sourceLinks']
        case['review'].update(status='core_checked',caseType=review['caseType'],outcome=case['punishment']['banDuration'],checkedAt=review['reviewedAt'],
                             individualReviewId=case['id'],scope='已逐案核對官方個案文件與名冊的身分、事件、規則及處分；未聲稱所有裁決全文或後續救濟程序均已審閱。',auditNotes=review.get('notes',[]))
        case['review']['registrySourceLocator'] = case['review']['sourceLocator']
        case['review']['sourceLocator'] = '；'.join(e['title']+'：'+e['locator'] for e in review['documents'])
        promoted += 1
    write(ROOT / 'data/curated-cases.json', curated)
    write(OUT / 'individual-review-queue.json', [
        {'id':c['id'],'name':c['athleteName'],
         'sourceUrls':c['officialRecord']['linkedDocuments'],
         'status':'pending_individual_review'}
        for c in curated if c['review']['status']=='registry_checked'])
    contract_path = OUT / 'completion-contract.json'
    contract = read(contract_path)
    contract['currentGap'] = f'{len(first)+promoted}/500 additions individually reviewed; {len(selected)-promoted} remain at registry level. No deployment performed.'
    write(contract_path, contract)
    retained_ids = occupied | set(corrections['redirects'])
    pending = [c for c in baseline if c['id'] not in retained_ids and c['id'] not in {x['id'] for x in corrections['quarantine']}]
    write(OUT / 'legacy-pending-cases.json', pending)
    write(OUT / 'selection-summary.json', {
        'checkedAt': max([DATE] + [r.get('reviewedAt', DATE) for r in individual_by_id.values() if r['disposition'] == 'accepted']),
        'registrySnapshotDate': DATE, 'targetNewCases': NEW_CASE_TARGET, 'targetTotal': NEW_CASE_TARGET + len(existing), 'existingCorrected': len(existing), 'announcementReviewed': len(first),
        'registryChecked': len(selected)-promoted, 'additionalIndividualReviewed': promoted,
        'newIndividualReviewed':len(first)+promoted,'newIndividualPending':len(selected)-promoted,
        'eligibleRegistryCandidates': len(candidates), 'heldBatchCases': len(reviews)-50,
        'legacyReplacedWithOfficialRecord': replaced, 'legacyPendingArchived': len(pending),
        'registrySources': dict(collections.Counter(c['id'].split('-')[0].upper() for c in selected)),
        'newCases': len(curated), 'baselineNameOverlap': 0,
        'scope': ('新增 500 件已逐案核對官方個案文件與名冊的案例，另保留 17 件既有校正／分案；未聲稱所有完整仲裁或上訴卷宗均已審閱。'
                  if promoted == len(selected) else '新增 500 個條目，另保留 17 件既有校正／分案；其中名冊層級紀錄仍須逐案補強證據，目標尚未完成。')})
    with (OUT / 'selected-cases.csv').open('w', encoding='utf-8-sig', newline='') as f:
        fields = ['id', 'athleteName', 'year', 'nationality', 'sport', 'reviewStatus', 'sourceLocator', 'sourceUrl']
        w = csv.DictWriter(f, fieldnames=fields); w.writeheader()
        for c in existing + curated:
            w.writerow({**{k:c[k] for k in fields[:5]}, 'reviewStatus':c['review']['status'], 'sourceLocator':c['review'].get('sourceLocator','見個案公告與勘誤紀錄'), 'sourceUrl':c['sourceLinks'][0]['url']})
    print('Curated:', len(curated), 'legacy pending:', len(pending), 'replaced:', replaced)

if __name__ == '__main__':
    main()
