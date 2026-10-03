from browser_support import browser_options, app_url
import sys, os
from pathlib import Path
workspace=Path(__file__).resolve().parents[2]
os.chdir(workspace)
Path('artifacts').mkdir(exist_ok=True)
sys.path.insert(0, str(workspace / '.local-tools'))
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(**browser_options())
    page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(app_url())
    page.wait_for_selector('.metric')
    # Run the existing Node mathematics suite in the browser JavaScript engine.
    suite=root.joinpath('tests/math.test.cjs').read_text(encoding='utf-8')
    page.evaluate('''source=>{const assert={ok(v,m){if(!v)throw Error(m||'assert.ok');},equal(a,b){if(a!==b)throw Error(`${a} != ${b}`);},throws(fn){let threw=false;try{fn();}catch(e){threw=true;}if(!threw)throw Error('Expected error');}};const require=name=>name==='node:assert/strict'?assert:TrigoMath;new Function('require',source)(require);}''',suite)
    def formula(text):
        page.locator('#formula').fill(text)
        page.locator('#formula-form button').click()
        assert page.locator('#error').inner_text()==''
    formula('3sen(2x-pi)+1')
    assert '3' in page.locator('#metrics').inner_text()
    page.locator('#deg').click()
    assert '90°' in page.locator('#metrics').inner_text()
    page.locator('#rad').click()
    formula('2sen(0x+pi/2)+1')
    page.locator('#slider-A').fill('3')
    assert abs(page.evaluate('M.evaluate(ast,0,unit)')-4)<1e-10
    formula('cos(0x)+10')
    assert page.evaluate('bounds().ymax')>=12
    page.locator('button[data-mode=challenge]').click()
    assert page.locator('#formula').is_visible()
    formula('3sen(2x)')
    page.locator('#check-challenge').click()
    assert 'Lo lograste' in page.locator('#feedback').inner_text()
    page.locator('button[data-mode=identity]').click()
    page.locator('#identity-choice').select_option('1')
    result=page.locator('#identity-result').inner_text()
    assert 'solo uno' not in result, result
    assert 'indefinido' in result, result
    # Todas las identidades del menú coinciden; cotg = 1/tan avisa que en cos(x) = 0 solo cotg está definida.
    for unit in ['rad','deg']:
        page.locator('#'+unit).click()
        for value in page.locator('#identity-choice option').evaluate_all('o=>o.map(e=>e.value)'):
            page.locator('#identity-choice').select_option(value)
            result=page.locator('#identity-result').inner_text()
            assert 'coinciden' in result and page.locator('#identity-error').inner_text()=='', (unit,value,result)
            assert ('solo uno' in result)==(value=='8'), (unit,value,result)
    page.locator('#rad').click()
    page.locator('button[data-mode=explore]').click()
    page.locator('#formula').fill('sen(')
    page.locator('#formula-form button').click()
    assert page.locator('#error').inner_text()
    formula('2sen(x-pi/2)+1')
    # Both canvases share x and transformed parameters; cardinal angles retain domains.
    page.locator('#motion-lessons button').nth(0).click()
    assert page.locator('#motion-value-sin').inner_text()=='y = 0'
    assert page.locator('#motion-value-cos').inner_text()=='y = 1'
    page.locator('#motion-position').fill('0.625')
    assert page.locator('#motion-value-sin').inner_text()=='y = 1'
    assert page.locator('#motion-value-cos').inner_text()=='y = 0'
    assert page.locator('#motion-value-tan').inner_text()=='No definida'
    page.locator('#motion-deg').click()
    assert page.locator('#motion-value-tan').inner_text()=='No definida'
    page.locator('#motion-position').fill('0.625')
    assert '90°' in page.locator('#motion-angle').inner_text()
    assert page.locator('#motion-value-tan').inner_text()=='No definida'
    page.locator('#motion-rad').click()
    page.locator('#motion-lessons button').nth(1).click()
    page.locator('#motion-position').fill('0.625')
    assert page.locator('#motion-value-sin').inner_text()=='y = 2'
    page.locator('#motion-answers button').nth(1).click()
    assert 'Exacto' in page.locator('#motion-feedback').inner_text()
    page.locator('#slider-A').fill('3')
    assert page.locator('#motion-answers button').first.is_disabled()
    page.locator('#motion-lessons button').nth(2).click()
    page.locator('#motion-position').fill('0.625')
    assert page.locator('#motion-value-cos').inner_text()=='y = -1'
    page.locator('#show-tan').uncheck()
    assert page.locator('#motion-status-tan').inner_text()=='Curva oculta'
    page.locator('#show-tan').check()
    formula('sen(x)^2+cos(x)^2')
    assert page.locator('#motion-unavailable').is_visible()
    assert not page.locator('#motion-visuals').is_visible()
    formula('sen(-2x+pi/2)+1')
    page.locator('#motion-zero').click()
    assert page.locator('#motion-value-sin').inner_text()=='y = 2'
    assert page.locator('#motion-value-tan').inner_text()=='No definida'
    formula('2sen(0x+pi/2)+1')
    assert page.locator('#motion-value-sin').inner_text()=='y = 3'
    page.locator('#motion-play').click()
    initial_scene=page.locator('#motion-angle').inner_text()
    page.wait_for_timeout(400)
    assert page.locator('#motion-angle').inner_text()!=initial_scene
    page.locator('#motion-play').click()
    assert page.locator('#play').inner_text()=='▶ Animar'
    page.locator('#motion-toggle').click()
    assert not page.locator('#motion-body').is_visible()
    page.locator('#motion-toggle').click()
    page.locator('#motion-lessons button').nth(0).click()
    page.locator('#motion-position').fill('0.5625')
    with page.expect_download() as result:
        page.locator('#motion-save').click()
    result.value.save_as('artifacts/escenario.png')
    page.locator('[aria-labelledby=motion-title]').screenshot(path='artifacts/escenario-escritorio.png')
    for width in [360,390,768]:
        page.set_viewport_size({'width':width,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.locator('[aria-labelledby=motion-title]').screenshot(path='artifacts/escenario-celular.png')
    page.set_viewport_size({'width':1440,'height':1000})
    page.locator('#play').click()
    initial=page.locator('#point').inner_text()
    page.wait_for_timeout(500)
    assert initial!=page.locator('#point').inner_text()
    page.locator('#play').click()
    with page.expect_download() as result:
        page.locator('#png').click()
    result.value.save_as('artifacts/grafica.png')
    page.locator('summary').click()
    with page.expect_download() as result:
        page.locator('#csv').click()
    result.value.save_as('artifacts/tabla.csv')
    assert 'funcion' in Path('artifacts/tabla.csv').read_text(encoding='utf-8-sig')
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path='artifacts/escritorio.png',full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path='artifacts/celular.png',full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.locator('#help').click()
    assert page.locator('#guide').is_visible()
    page.locator('#close-guide').click()
    assert not errors, errors
    print('OK: pruebas matematicas y de navegador; PNG/CSV, movil y guia. Sin errores JavaScript.')
    browser.close()
