// tests/letter.test.js
const { TemplateManager } = require('../js/templates.js'); // If using CommonJS; but we have ES modules. Use dynamic import for Jest with Babel.
// We'll simulate with simple assertions.

describe('Template Management', () => {
    let templateManager;
    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            store: {},
            getItem(key) { return this.store[key] || null; },
            setItem(key, value) { this.store[key] = value; },
            removeItem(key) { delete this.store[key]; },
            clear() { this.store = {}; }
        };
        templateManager = new TemplateManager();
    });

    test('should load default templates', () => {
        expect(templateManager.getAllTemplates().length).toBeGreaterThanOrEqual(5);
    });

    test('should add a new template', () => {
        const tpl = { name: 'Test', header: {}, bodyHTML: '<p>Test</p>', rectangles: {} };
        templateManager.addTemplate(tpl);
        expect(templateManager.getAllTemplates().length).toBe(6); // 5 defaults + 1
    });

    test('should delete a template', () => {
        const initialCount = templateManager.getAllTemplates().length;
        const id = templateManager.getAllTemplates()[0].id;
        templateManager.deleteTemplate(id);
        expect(templateManager.getAllTemplates().length).toBe(initialCount - 1);
    });
});

describe('Rectangle State', () => {
    const { CustomRectangle } = require('../js/canvas.js');
    test('should update properties', () => {
        const rect = new CustomRectangle('test', 'header', { x: 10, y: 10, width: 100, height: 50 });
        rect.updateProps({ fill: '#ff0000', borderColor: '#00ff00' });
        expect(rect.props.fill).toBe('#ff0000');
        expect(rect.props.borderColor).toBe('#00ff00');
    });
});
