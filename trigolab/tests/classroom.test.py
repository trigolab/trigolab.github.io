from browser_support import browser_options, app_url
"""Pruebas reales de temas, presentación y video. Ejecutar desde cualquier carpeta."""
import os
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
os.chdir(root.parent)
sys.path.insert(0, str(root.parent / '.local-tools'))
from playwright.sync_api import sync_playwright

with sync_playwright() as pw:
    browser = pw.chromium.launch(**browser_options())
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(app_url())
    page.locator('#theme').select_option('dark')
    assert page.locator('html').get_attribute('data-theme') == 'dark'
    page.reload()
    assert page.locator('#theme').input_value() == 'dark'
    page.locator('#motion-lessons button').first.click()
    page.locator('#motion-position').fill('0.5625')
    page.locator('#focus-projections').click()
    assert not page.locator('#show-tan').is_checked()
    page.locator('[aria-labelledby=motion-title]').screenshot(path='artifacts/tema-oscuro.png')
    page.locator('#theme').select_option('light')
    assert page.locator('html').get_attribute('data-theme') == 'light'
    page.locator('[aria-labelledby=motion-title]').screenshot(path='artifacts/tema-claro.png')
    page.locator('#theme').select_option('system')
    page.emulate_media(color_scheme='dark')
    page.wait_for_function("document.documentElement.dataset.theme==='dark'")
    assert page.locator('html').get_attribute('data-theme') == 'dark'
    page.locator('#focus-all').click()
    page.locator('#student-explanation').fill('Al duplicar B, el período se reduce a la mitad.')
    with page.expect_download() as download:
        page.locator('#save-report').click()
    download.value.save_as('artifacts/ficha.txt')
    assert 'período se reduce' in Path('artifacts/ficha.txt').read_text(encoding='utf-8-sig')
    before = page.locator('#motion-position').input_value()
    with page.expect_download(timeout=25000) as download:
        page.locator('#record-video').click()
        assert page.locator('#slider-A').is_disabled()
    path = Path('artifacts') / download.value.suggested_filename
    download.value.save_as(str(path))
    assert path.stat().st_size > 10000
    assert not page.locator('#slider-A').is_disabled()
    assert page.locator('#motion-position').input_value() == before
    # Decode the generated video in Chrome and verify real, distinct frames.
    metadata = page.evaluate('''async()=>{
      const v=document.createElement('video');v.muted=true;v.src=document.getElementById('video-download').href;
      await new Promise((yes,no)=>{v.onloadedmetadata=yes;v.onerror=no;});
      const canvas=document.createElement('canvas');canvas.width=v.videoWidth;canvas.height=v.videoHeight;
      async function frame(t){v.currentTime=t;await new Promise(r=>v.onseeked=r);canvas.getContext('2d').drawImage(v,0,0);return canvas.toDataURL();}
      const a=await frame(1),b=await frame(4);
      return {width:v.videoWidth,height:v.videoHeight,duration:v.duration,different:a!==b};
    }''')
    assert metadata['width'] == 1200 and metadata['height'] == 620
    assert metadata['different'], metadata
    print('Video reproducible:', path, metadata)
    # Early stop produces a valid download and unlocks the app too.
    page.locator('#record-video').click()
    page.wait_for_timeout(1200)
    with page.expect_download() as partial:
        page.locator('#stop-video').click()
    partial.value.save_as('artifacts/parcial.' + partial.value.suggested_filename.split('.')[-1])
    assert not page.locator('#theme').is_disabled()
    page.locator('#share-class').click()
    if app_url().startswith(('https://','http://')):
        page.locator('#share-info input').first.wait_for()
        from urllib.parse import urlsplit
        expected=urlsplit(app_url())
        actual=urlsplit(page.locator('#share-info input').first.input_value())
        assert actual.hostname==expected.hostname
    else:
        assert 'sin servidor' in page.locator('#share-info').inner_text()
    page.locator('#close-share').click()
    for width in [360, 390, 768]:
        page.set_viewport_size({'width':width,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path='artifacts/aula-celular.png')
    assert not errors, errors
    browser.close()
print('OK: temas, ficha, video completo y parcial, controles restaurados, móvil y modo offline.')
