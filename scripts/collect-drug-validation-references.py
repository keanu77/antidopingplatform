#!/usr/bin/env python3
"""Collect references for a fixed sample; never mutate the frozen rules or cohort."""
import argparse
from datetime import datetime, timezone
import gzip
import hashlib
import html
import importlib.util
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('reference_parser', ROOT / 'scripts/collect-drug-reference-evidence.py')
ref = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ref)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def valid_detail_url(url):
    return bool(re.fullmatch(r'https://www\.check-antidoping\.org\.tw/inquiry_page\.php\?id=\d+&category=2', url))


def candidates(document, product):
    if 'inquiry-list' not in document or 'p-quantity' not in document:
        raise ValueError('Unrecognized search response, not evidence of absence')
    wanted = {ref.title_key(product[k]) for k in ['nameZh', 'nameEn'] if product.get(k)}
    result = set()
    for href, title in re.findall(r'<a href="(inquiry_page\.php\?id=\d+&category=2)"[^>]+title="([^"]+)"', document):
        names = {ref.title_key(n) for n in html.unescape(title).split('┃')}
        if names & wanted:
            result.add(ref.BASE + href)
    return sorted(result)


def product_fact(document, meta, product, checkpoint_id):
    fact = ref.parse_detail(document)
    if fact['license'] != product['license']:
        return None  # Identical trade names can belong to different licenses.
    normset = lambda names: {ref.norm(n) for n in names if n.strip()}
    source = normset(fact['ingredientNames'])
    return {**fact, **meta, 'compositionMatchesTfda': source == normset(product['ingredientNames']),
            'sourceSummaryMatchesTfda': source == normset(product['ingredientSummary'].split(';;')),
            'reviewStatus': 'validation-reference-not-rule-input', 'checkpoint': checkpoint_id,
            'collectedForLicense': product['license']}


def ingredient_queries(product):
    # Ordinary ingredient keywords for products with no located trade-name
    # result. This is only a locator, never an identity normalization rule.
    return list(dict.fromkeys(query for name in product['ingredientNames']
                             if re.fullmatch(r'[A-Za-z0-9 .()\-]{3,150}', query := ref.search_name(name))))[:2]


def trade_queries(product):
    # Keep exact names. Do not strip punctuation from rejected queries or
    # retry products that already had a denied/incomplete response.
    return list(dict.fromkeys(name for key in ['nameZh','nameEn']
                             if (name := product.get(key,'')) and not re.search(r'["\'“”‘’「」『』′;<>]',name)))


class AccessStopped(Exception):
    pass


class RequestBudget(Exception):
    pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--checkpoint', type=Path, required=True)
    parser.add_argument('--sample', type=Path, required=True)
    parser.add_argument('--candidate-index', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--max-requests', type=int, default=120)
    parser.add_argument('--max-products', type=int, default=150)
    parser.add_argument('--delay', type=float, default=2.0)
    parser.add_argument('--verify-cache', action='store_true')
    parser.add_argument('--known-links-only', action='store_true', help='Read only previously observed detail links; do not submit searches')
    parser.add_argument('--ingredient-search-only', action='store_true', help='Use at most two plain ingredient keywords for remaining fixed-sample products')
    parser.add_argument('--trade-name-search-only', action='store_true', help='Use exact names that contain no quote/control punctuation; never retry failed products')
    args = parser.parse_args()
    if args.delay < 1 or not 1 <= args.max_requests <= 300 or args.max_products < 1:
        parser.error('Use at least 1 second and 1–300 requests per run')
    if sum([args.known_links_only,args.ingredient_search_only,args.trade_name_search_only])>1:parser.error('Choose one collection mode')
    cp = args.checkpoint.resolve()
    manifest_raw = (cp/'manifest.json').read_bytes()
    manifest = json.loads(manifest_raw)
    sample_raw = args.sample.read_bytes()
    sample = json.loads(sample_raw)
    if sample['checkpointManifestSha256'] != sha(manifest_raw):
        raise ValueError('Sample checkpoint mismatch')
    for name in ['data/drugs/catalog.json.gz', 'artifacts/drugs/reference-checks/facts.json']:
        if sha((cp/name).read_bytes()) != manifest['files'][name]:
            raise ValueError('Frozen input changed: '+name)
    products = {p['license']: p for p in json.load(gzip.open(cp/'data/drugs/catalog.json.gz'))['products']}
    licenses = sample['randomLicenses']
    if len(licenses) != sample['size'] or len(set(licenses)) != len(licenses) or any(l not in products for l in licenses):
        raise ValueError('Malformed fixed sample')
    allowed = set(licenses)
    identity = {'checkpoint': manifest['id'], 'checkpointManifestSha256': sha(manifest_raw), 'sampleSha256': sha(sample_raw)}
    args.output.mkdir(parents=True, exist_ok=True)
    cache = args.output/'cache';cache.mkdir(exist_ok=True)
    identity_path = args.output/'collection-identity.json'
    if identity_path.exists():
        if json.loads(identity_path.read_text()) != identity:
            raise ValueError('Collection belongs to another sample')
    elif not args.verify_cache:
        ref.write_json(identity_path, identity)
    else:
        raise ValueError('Missing collection identity')
    facts_path = args.output/'facts.json'
    facts = json.loads(facts_path.read_text()) if facts_path.exists() else []
    if args.verify_cache:
        verified = []
        for fact in facts:
            if fact['license'] not in allowed or not valid_detail_url(fact['url']):
                raise ValueError('Reference outside fixed sample')
            ref.verify_cached_fact(fact, cache)
            key=sha(fact['url'].encode());meta=json.loads((cache/(key+'.json')).read_text())
            rebuilt=product_fact((cache/(key+'.html')).read_text(),meta,products[fact['license']],manifest['id'])
            if rebuilt != fact:
                raise ValueError('Reference metadata or formula flags changed')
            verified.append(rebuilt)
        print(json.dumps(verified, ensure_ascii=False));return
    state_path=args.output/'attempts.json';attempts=json.loads(state_path.read_text()) if state_path.exists() else []
    stop_path=args.output/'access-stop.json'
    if stop_path.exists():
        raise ValueError('A previous access restriction stopped this collection; no automatic retry')
    baseline={f['license'] for f in json.loads((cp/'artifacts/drugs/reference-checks/facts.json').read_text())}
    collected={f['license'] for f in facts}
    # Never automatically retry a rejected/incomplete response. Other observed
    # product links may be read, but a site-wide access stop above remains final.
    done_statuses={'collected','no-exact-match-in-attempted-searches','retrieval-or-parser-error','access-stopped'}
    if args.known_links_only:done_statuses.add('known-links-not-exact-license')
    if args.ingredient_search_only:done_statuses.add('no-exact-match-in-attempted-ingredient-searches')
    if args.trade_name_search_only:done_statuses.update(['no-exact-match-in-attempted-trade-name-searches','no-supported-trade-name-query'])
    done={a['license'] for a in attempts if a['status'] in done_statuses}
    index={r['license']:r['candidateUrls'] for r in json.loads(args.candidate_index.read_text())['rows']} if args.candidate_index else {}
    requests=0;last=0.0

    def save():
        ref.write_json(facts_path,facts);ref.write_json(state_path,attempts)

    def fetch(url):
        nonlocal requests,last
        parsed=urllib.parse.urlsplit(url)
        if parsed.scheme!='https' or parsed.netloc!='www.check-antidoping.org.tw' or parsed.path not in ['/inquiry.php','/inquiry_page.php']:
            raise ValueError('Unexpected reference URL')
        if parsed.path=='/inquiry_page.php' and not valid_detail_url(url):
            raise ValueError('Unexpected detail URL')
        key=sha(url.encode());raw_path=cache/(key+'.html');meta_path=cache/(key+'.json')
        if raw_path.exists() and meta_path.exists():
            raw=raw_path.read_bytes();meta=json.loads(meta_path.read_text())
            if meta['url']!=url or sha(raw)!=meta['sha256']:raise ValueError('Cache checksum mismatch')
            return raw.decode('utf-8'),meta
        if requests>=args.max_requests:raise RequestBudget('Request budget reached')
        time.sleep(max(0,args.delay-(time.monotonic()-last)));last=time.monotonic();requests+=1
        req=urllib.request.Request(url,headers={'User-Agent':'AntidopingPlatform-ReferenceResearch/1.0'})
        try:
            with urllib.request.urlopen(req,timeout=25) as response:raw=response.read(5_000_001)
        except urllib.error.HTTPError as exc:
            if exc.code in [401,403,429]:
                ref.write_json(stop_path,{'url':url,'status':exc.code,'retryAfter':exc.headers.get('Retry-After'),'at':datetime.now(timezone.utc).isoformat()})
                raise AccessStopped(str(exc)) from exc
            raise
        if len(raw)>5_000_000:raise ValueError('Oversized reference')
        meta={'url':url,'retrievedAt':datetime.now(timezone.utc).isoformat(),'sha256':sha(raw)}
        raw_path.write_bytes(raw);ref.write_json(meta_path,meta)
        return raw.decode('utf-8'),meta

    started=datetime.now(timezone.utc).isoformat();processed=0;stop_reason=None
    for license_number in licenses:
        if processed>=args.max_products:break
        if license_number in baseline or license_number in collected or license_number in done:continue
        if args.known_links_only and not index.get(license_number):continue
        processed+=1;product=products[license_number]
        attempt={'license':license_number,'startedAt':datetime.now(timezone.utc).isoformat(),'queries':[],'details':[],'status':'pending'}
        tried=set()
        try:
            def inspect(urls):
                for url in urls:
                    if url in tried:continue
                    tried.add(url)
                    if not valid_detail_url(url):raise ValueError('Invalid candidate detail URL')
                    attempt['activeUrl']=url
                    document,meta=fetch(url);fact=product_fact(document,meta,product,manifest['id'])
                    attempt['details'].append({'url':url,'matchingLicense':bool(fact)})
                    attempt.pop('activeUrl',None)
                    if fact:
                        facts.append(fact);collected.add(license_number);attempt['status']='collected';return True
                return False
            found=inspect(index.get(license_number,[]))
            if not found and not args.known_links_only:
                queries=ingredient_queries(product) if args.ingredient_search_only else trade_queries(product) if args.trade_name_search_only else dict.fromkeys([license_number,product['nameZh'],product['nameEn']])
                for query in queries:
                    if not query:continue
                    url=ref.BASE+'inquiry.php?'+urllib.parse.urlencode({'category':2,'part':13,'sport':102,'keyword':query,'pageSize':1000 if args.ingredient_search_only else 100})
                    attempt['activeUrl']=url
                    document,_=fetch(url);urls=candidates(document,product)
                    attempt['queries'].append({'query':query,'url':url,'exactTitleCandidates':len(urls)})
                    attempt.pop('activeUrl',None)
                    if inspect(urls):found=True;break
            if not found:
                if args.known_links_only:attempt['status']='known-links-not-exact-license'
                elif args.ingredient_search_only:attempt['status']='no-exact-match-in-attempted-ingredient-searches'
                elif args.trade_name_search_only:attempt['status']='no-exact-match-in-attempted-trade-name-searches' if attempt['queries'] else 'no-supported-trade-name-query'
                else:attempt['status']='no-exact-match-in-attempted-searches'
        except RequestBudget as exc:
            attempt.update(status='pending-budget',error=str(exc));stop_reason='request-budget'
        except AccessStopped as exc:
            attempt.update(status='access-stopped',error=str(exc));stop_reason='access-restriction'
        except (urllib.error.URLError,ValueError,TimeoutError) as exc:
            attempt.update(status='retrieval-or-parser-error',error=str(exc));stop_reason='retrieval-or-parser-error'
        attempts.append(attempt);save()
        print(json.dumps({'license':license_number,'status':attempt['status'],'newReferences':len(facts),'requests':requests},ensure_ascii=False),flush=True)
        if stop_reason:break
    save()
    report={'startedAt':started,'finishedAt':datetime.now(timezone.utc).isoformat(),'requests':requests,'productsAttempted':processed,'collectedReferences':len(facts),'stopReason':stop_reason,'knownLinksOnly':args.known_links_only,'ingredientSearchOnly':args.ingredient_search_only,'tradeNameSearchOnly':args.trade_name_search_only,'clinicalRulesChanged':False,**identity}
    (args.output/'runs').mkdir(exist_ok=True)
    ref.write_json(args.output/'runs'/(started.replace(':','-')+'.json'),report)
    print(json.dumps(report,ensure_ascii=False),flush=True)


if __name__=='__main__':main()
