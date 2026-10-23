import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
from tempfile import TemporaryDirectory
from contextlib import redirect_stdout
import io
import gzip
import json
spec=importlib.util.spec_from_file_location('collector',Path(__file__).resolve().parents[1]/'scripts/collect-drug-validation-references.py')
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
def doc(license='L1',ingredients='A;;B'):
 return f'''<h3>藥名</h3><p>產品</p><h3>禁用物質名</h3><div class="col">不含禁用物質</div><h3>許可證字號</h3><div class="col">{license}</div><h3>主成分略述</h3><div class="col">{ingredients}</div><div class="w-100 text-center text-5 position-relative">不禁止</div><div class="w-100 text-center text-5 position-relative">不禁止</div><div>條件/警告</div><div class="col">test</div>'''
class ValidationCollectorTests(unittest.TestCase):
 def test_same_name_different_license_is_not_a_match(self):
  self.assertIsNone(c.product_fact(doc('L2'),{}, {'license':'L1'},'cp'))
 def test_formula_mismatch_is_preserved_not_fixed(self):
  p={'license':'L1','ingredientNames':['A','B'],'ingredientSummary':'A;;B'}
  f=c.product_fact(doc(ingredients='A;;C'),{},p,'cp')
  self.assertFalse(f['compositionMatchesTfda']);self.assertFalse(f['sourceSummaryMatchesTfda'])
  self.assertEqual(f['ingredientNames'],['A','C'])
 def test_search_page_error_is_not_no_results(self):
  for response in ['Access denied', '偵測到惡意指令A2, 請聯繫管理員', '']:
   with self.subTest(response=response),self.assertRaises(ValueError):c.candidates(response,{'nameZh':'藥品','nameEn':'drug'})
 def test_title_normalization_never_matches_a_prefix(self):
  d='<div class="inquiry-list" id="p-quantity"><a href="inquiry_page.php?id=2&category=2" class="row" title="藥品甲 ┃ Drug A">a</a></div>'
  self.assertEqual(c.candidates(d,{'nameZh':'藥品','nameEn':'Drug'}),[])
  self.assertEqual(len(c.candidates(d,{'nameZh':'藥品甲','nameEn':'DRUG A'})),1)
 def test_external_and_non_detail_candidates_are_rejected(self):
  self.assertTrue(c.valid_detail_url('https://www.check-antidoping.org.tw/inquiry_page.php?id=2&category=2'))
  for url in ['http://www.check-antidoping.org.tw/inquiry_page.php?id=2&category=2','https://example.com/inquiry_page.php?id=2&category=2','https://www.check-antidoping.org.tw/inquiry_page.php?id=2&category=2&extra=1']:
   self.assertFalse(c.valid_detail_url(url))
 def test_ingredient_keywords_are_bounded_locators_only(self):
  p={'ingredientNames':['ACETAMINOPHEN (EQ TO PARACETAMOL)','CAFFEINE','CAFFEINE','UNKNOWN "QUOTE"','THIRD INGREDIENT']}
  self.assertEqual(c.ingredient_queries(p),['ACETAMINOPHEN','CAFFEINE'])
  self.assertEqual(p['ingredientNames'][0],'ACETAMINOPHEN (EQ TO PARACETAMOL)')
  self.assertEqual(c.ingredient_queries({'ingredientNames':['UNKNOWN "QUOTE"']}),[])
 def test_trade_queries_keep_full_names_and_do_not_strip_quotes(self):
  self.assertEqual(c.trade_queries({'nameZh':'乙保康錠','nameEn':'Ease Acetaminophen Tablets'}),['乙保康錠','Ease Acetaminophen Tablets'])
  self.assertEqual(c.trade_queries({'nameZh':'"品牌"藥品','nameEn':'Drug "Brand"'}),[])

class ValidationCacheTests(unittest.TestCase):
 def setUp(self):
  self.tmp=TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
  self.root=Path(self.tmp.name);self.cp=self.root/'cp';self.out=self.root/'references'
  self.cache=self.out/'cache';self.cache.mkdir(parents=True)
  self.product={'license':'L1','nameZh':'藥品','nameEn':'Drug','ingredientNames':['A','B'],'ingredientSummary':'A;;B'}
  files={'data/drugs/catalog.json.gz':gzip.compress(json.dumps({'products':[self.product]}).encode()),'artifacts/drugs/reference-checks/facts.json':b'[]'}
  for name,raw in files.items():
   p=self.cp/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
  manifest=json.dumps({'id':'cp','files':{name:c.sha(raw) for name,raw in files.items()}}).encode();(self.cp/'manifest.json').write_bytes(manifest)
  sample=json.dumps({'checkpointManifestSha256':c.sha(manifest),'size':1,'randomLicenses':['L1']}).encode();self.sample=self.root/'sample.json';self.sample.write_bytes(sample)
  c.ref.write_json(self.out/'collection-identity.json',{'checkpoint':'cp','checkpointManifestSha256':c.sha(manifest),'sampleSha256':c.sha(sample)})
  self.url='https://www.check-antidoping.org.tw/inquiry_page.php?id=2&category=2';self.key=c.sha(self.url.encode());raw=doc().encode()
  meta={'url':self.url,'retrievedAt':'2026-10-23T15:00:00Z','sha256':c.sha(raw)}
  (self.cache/(self.key+'.html')).write_bytes(raw);c.ref.write_json(self.cache/(self.key+'.json'),meta)
  self.fact=c.product_fact(raw.decode(),meta,self.product,'cp');c.ref.write_json(self.out/'facts.json',[self.fact])
 def run_main(self,*extra):
  args=['collector','--checkpoint',str(self.cp),'--sample',str(self.sample),'--output',str(self.out),*extra]
  with patch('sys.argv',args),patch.object(c.urllib.request,'urlopen',side_effect=AssertionError('No network allowed in test')),redirect_stdout(io.StringIO()) as output:
   c.main()
  return output.getvalue()
 def test_cache_verification_reparses_product(self):
  self.assertEqual(json.loads(self.run_main('--verify-cache')),[self.fact])
 def test_changed_html_is_rejected(self):
  (self.cache/(self.key+'.html')).write_text(doc(ingredients='A;;C'))
  with self.assertRaisesRegex(ValueError,'checksum'):self.run_main('--verify-cache')
 def test_edited_formula_flag_or_timestamp_is_rejected(self):
  for field,value in [('compositionMatchesTfda',False),('retrievedAt','2099-01-01T00:00:00Z')]:
   with self.subTest(field=field):
    c.ref.write_json(self.out/'facts.json',[{**self.fact,field:value}])
    with self.assertRaisesRegex(ValueError,'metadata or formula'):self.run_main('--verify-cache')
 def test_access_stop_prevents_automatic_network_retry(self):
  c.ref.write_json(self.out/'access-stop.json',{'status':429})
  with self.assertRaisesRegex(ValueError,'no automatic retry'):self.run_main()
 def test_failed_product_is_not_retried_in_next_batch(self):
  c.ref.write_json(self.out/'facts.json',[])
  c.ref.write_json(self.out/'attempts.json',[{'license':'L1','status':'retrieval-or-parser-error'}])
  index=self.root/'index.json';c.ref.write_json(index,{'rows':[{'license':'L1','candidateUrls':[self.url]}]})
  report=json.loads(self.run_main('--known-links-only','--candidate-index',str(index)))
  self.assertEqual(report['productsAttempted'],0);self.assertEqual(report['requests'],0)
if __name__=='__main__':unittest.main()
