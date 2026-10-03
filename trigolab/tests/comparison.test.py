from browser_support import browser_options, app_url
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root.parent/'.local-tools'))
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    browser=pw.chromium.launch(**browser_options())
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(app_url())
    page.locator('[data-mode=formulas]').click()
    for i in range(3):assert page.locator(f'#expression-{i}').input_value()==''
    def formulas(items):
        for i,value in enumerate(items):page.locator(f'#expression-{i}').fill(value)
        page.locator('#multi-form button[type=submit]').click()
    formulas(['sen(x)','2sen(x)','sen(x)+1'])
    page.locator('#multi-position').fill('0.625')
    legend=page.locator('#multi-legend').inner_text()
    assert 'f1(x) = sen(x) → 1' in legend
    assert 'f2(x) = 2sen(x) → 2' in legend
    assert 'f3(x) = sen(x)+1 → 2' in legend
    page.locator('#visible-1').uncheck()
    assert 'f2(x)' not in page.locator('#multi-legend').inner_text()
    page.locator('#visible-1').check()
    formulas(['x^2','1/(x-1)','sen('])
    assert page.locator('#expression-2').get_attribute('aria-invalid')=='true'
    assert 'f1(x)' in page.locator('#multi-legend').inner_text()
    formulas(['tan(x)','sen(x)/cos(x)',''])
    assert page.locator('#multi-legend').inner_text().count('No definida')==2
    page.locator('#multi-unit').select_option('deg')
    assert page.locator('#multi-legend').inner_text().count('No definida')==2
    formulas(['x^2','cos(x)','3sen(x-90)+2'])
    page.locator('#multi-fit').click()
    with page.expect_download() as result:page.locator('#multi-csv').click()
    result.value.save_as(str(root.parent/'artifacts/comparacion.csv'))
    assert 'f3(x) = 3sen(x-90)+2' in (root.parent/'artifacts/comparacion.csv').read_text(encoding='utf-8-sig')
    with page.expect_download() as result:page.locator('#multi-png').click()
    result.value.save_as(str(root.parent/'artifacts/comparacion.png'))
    page.locator('#multi-play').click()
    before=page.locator('#multi-position').input_value()
    page.wait_for_timeout(300)
    assert page.locator('#multi-position').input_value()!=before
    page.locator('#multi-play').click()
    page.locator('#multi-unit').select_option('rad')
    formulas(['sen(x)','2sen(x)','cos(x)+1'])
    page.locator('#multi-y').fill('4');page.locator('#multi-y').press('Tab')
    page.locator('#compare-mode').screenshot(path=str(root.parent/'artifacts/comparador-escritorio.png'))
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.locator('#compare-mode').screenshot(path=str(root.parent/'artifacts/comparador-celular.png'))
    page.locator('[data-mode=explore]').click()
    assert page.locator('#formula').is_visible()
    page.locator('[data-mode=formulas]').click()
    assert page.locator('#expression-1').input_value()=='2sen(x)'
    assert not errors,errors
    browser.close()
print('OK: tres fórmulas libres, errores por casillero, unidades, exportaciones, animación y móvil.')
