import importlib.util
from io import BytesIO
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import solar_services as s

class SolarServicesTests(unittest.TestCase):
    def test_coordinate_validation(self):
        for lat,lon in [(float('nan'),26),(44,100),(0,0)]:
            with self.assertRaises(ValueError):s.climate(lat,lon)
    def test_live_response_and_cache(self):
        raw={'properties':{'parameter':{'ALLSKY_SFC_SW_DWN':dict.fromkeys(s.MONTHS,4)}}}
        s._CACHE.clear()
        with patch('solar_services.urllib.request.urlopen',return_value=BytesIO(json.dumps(raw).encode())) as request:
            first=s.climate(44.4268,26.1025);second=s.climate(44.4268,26.1025)
        self.assertEqual(request.call_count,1);self.assertEqual(len(first['monthly_psh']),12)
        self.assertEqual(second['delivery'],'local_cache_24h')
    def test_missing_climate_fails(self):
        s._CACHE.clear()
        raw={'properties':{'parameter':{'ALLSKY_SFC_SW_DWN':dict.fromkeys(s.MONTHS,-999)}}}
        with patch('solar_services.urllib.request.urlopen',return_value=BytesIO(json.dumps(raw).encode())):
            with self.assertRaises(ValueError):s.climate(44,26)
    def test_file_validation(self):
        self.assertEqual(s.post_response('/api/solar/bill-text',b'not-an-image','image/png')[0],400)
        self.assertEqual(s.post_response('/api/solar/climate',b'[]','application/json')[0],400)
        self.assertEqual(s.post_response('/api/solar/unknown',b'{}','application/json')[0],404)
    def test_ai_disabled_and_configured(self):
        with patch.dict('solar_services.os.environ', {'OEV_AI_KEY': '', 'OEV_AI_ENDPOINT': '', 'OEV_AI_MODEL': ''}):
            self.assertEqual(s.configured_advice({})[0],503)
        env={'OEV_AI_KEY':'test-token','OEV_AI_ENDPOINT':'https://example.com/chat/completions','OEV_AI_MODEL':'test-model'}
        response=BytesIO(json.dumps({'choices':[{'message':{'content':'Explicatie de test'}}]}).encode())
        with patch.dict('solar_services.os.environ',env), patch('solar_services.urllib.request.urlopen',return_value=response) as request:
            status,result=s.configured_advice({'question':'Ce inseamna NPV?','metrics':{'kwp':6,'address':'DO NOT SEND','monthly_bill':'DO NOT SEND'}})
            sent=json.loads(request.call_args[0][0].data)
        self.assertEqual(status,200);self.assertEqual(result['text'],'Explicatie de test')
        self.assertNotIn('DO NOT SEND',sent['messages'][1]['content'])
    @unittest.skipUnless(importlib.util.find_spec('fitz') and importlib.util.find_spec('pypdf'),'optional PDF libraries unavailable')
    def test_actual_pdf_text(self):
        import fitz
        doc=fitz.open();page=doc.new_page();page.insert_text((50,50),'DEMO FICTIV: Total de plata: 500.20 RON. Consum 250 kWh.');body=doc.tobytes();doc.close()
        result=s.extract_bill(body,'application/pdf')
        self.assertIn('500.20',result['text']);self.assertFalse(result['external_upload'])
    @unittest.skipUnless(s.shutil.which('tesseract') and importlib.util.find_spec('PIL'),'optional OCR unavailable')
    def test_actual_local_ocr(self):
        from PIL import Image,ImageDraw,ImageFont
        image=Image.new('RGB',(1400,250),'white');draw=ImageDraw.Draw(image)
        font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',46)
        draw.text((25,50),'Total de plata: 500.20 RON',fill='black',font=font)
        buffer=BytesIO();image.save(buffer,format='PNG')
        result=s.extract_bill(buffer.getvalue(),'image/png')
        self.assertIn('500.20',result['text']);self.assertFalse(result['external_upload'])

if __name__=='__main__':unittest.main()
