const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function section(start, end) {
    const offset = html.indexOf(start);
    assert.ok(offset >= 0);
    const finish = html.indexOf(end, offset);
    assert.ok(finish > offset);
    return html.slice(offset, finish);
}

test('workout titles and instructions cannot insert executable HTML', () => {
    const context = vm.createContext({ t: text => text });
    vm.runInContext(section('function escapeHtml(', 'function updateCustomWorkoutStep('), context);
    vm.runInContext(section('function splitGuideTitle(', 'function renderTrainingGuide('), context);
    const attack = '<img src=x onerror="alert(1)">';
    for (const title of [attack, 'Round 1 - ' + attack]) {
        const rendered = context.renderGuideTitle(title);
        assert.ok(!rendered.includes('<img'));
        assert.ok(rendered.includes('&lt;img'));
        assert.ok(rendered.includes('&quot;'));
    }
    assert.ok(!context.renderGuideInstructions(attack).includes('<img'));
    assert.match(context.renderGuideTitle('Round 2 - Jab and movement'), /guide-round-label">Round 2/);
});
