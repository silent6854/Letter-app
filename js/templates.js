// templates.js - Template management
import { getTranslation } from './i18n.js';

const DEFAULT_TEMPLATES = [
    {
        id: 'tpl-request',
        name: 'Request Letter',
        type: 'request',
        header: {
            organization: 'ABC Company',
            logoUrl: '',
            date: new Date().toISOString().split('T')[0],
            attachment: false,
            letterNumber: 'REQ-2024-001'
        },
        bodyHTML: '<p>Dear Sir/Madam,</p><p>I am writing to request...</p>',
        rectangles: {
            header: { props: { x: 20, y: 20, width: 170, height: 30, fill: '#e0f2fe', borderColor: '#0369a1', borderWidth: 2, cornerRadius: 5 } },
            body: { props: { x: 20, y: 60, width: 170, height: 200, fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0 } }
        }
    },
    // Add 4 more templates similarly...
    {
        id: 'tpl-complaint',
        name: 'Complaint Letter',
        type: 'complaint',
        header: { organization: 'XYZ Corp', logoUrl: '', date: new Date().toISOString().split('T')[0], attachment: false, letterNumber: 'CMP-2024-002' },
        bodyHTML: '<p>I am writing to express my dissatisfaction...</p>',
        rectangles: {
            header: { props: { x: 20, y: 20, width: 170, height: 30, fill: '#fee2e2', borderColor: '#b91c1c', borderWidth: 2, cornerRadius: 5 } },
            body: { props: { x: 20, y: 60, width: 170, height: 200, fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0 } }
        }
    },
    {
        id: 'tpl-invitation',
        name: 'Invitation Letter',
        type: 'invitation',
        header: { organization: 'Events Ltd.', logoUrl: '', date: new Date().toISOString().split('T')[0], attachment: false, letterNumber: 'INV-2024-003' },
        bodyHTML: '<p>You are cordially invited to...</p>',
        rectangles: {
            header: { props: { x: 20, y: 20, width: 170, height: 30, fill: '#dcfce7', borderColor: '#15803d', borderWidth: 2, cornerRadius: 5 } },
            body: { props: { x: 20, y: 60, width: 170, height: 200, fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0 } }
        }
    },
    {
        id: 'tpl-memo',
        name: 'Internal Memo',
        type: 'memo',
        header: { organization: 'Internal Dept.', logoUrl: '', date: new Date().toISOString().split('T')[0], attachment: false, letterNumber: 'MEMO-2024-004' },
        bodyHTML: '<p>To all employees,</p><p>Please be informed...</p>',
        rectangles: {
            header: { props: { x: 20, y: 20, width: 170, height: 30, fill: '#fef9c3', borderColor: '#a16207', borderWidth: 2, cornerRadius: 5 } },
            body: { props: { x: 20, y: 60, width: 170, height: 200, fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0 } }
        }
    },
    {
        id: 'tpl-thanks',
        name: 'Thank You Letter',
        type: 'thanks',
        header: { organization: 'Gratitude Inc.', logoUrl: '', date: new Date().toISOString().split('T')[0], attachment: false, letterNumber: 'THX-2024-005' },
        bodyHTML: '<p>I would like to express my sincere gratitude...</p>',
        rectangles: {
            header: { props: { x: 20, y: 20, width: 170, height: 30, fill: '#ede9fe', borderColor: '#6d28d9', borderWidth: 2, cornerRadius: 5 } },
            body: { props: { x: 20, y: 60, width: 170, height: 200, fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0 } }
        }
    }
];

class TemplateManager {
    constructor() {
        this.templates = [];
        this.loadTemplates();
    }

    loadTemplates() {
        const stored = localStorage.getItem('letter-templates');
        if (stored) {
            try {
                this.templates = JSON.parse(stored);
            } catch {
                this.templates = [...DEFAULT_TEMPLATES];
            }
        } else {
            this.templates = [...DEFAULT_TEMPLATES];
            this.saveTemplates();
        }
    }

    saveTemplates() {
        localStorage.setItem('letter-templates', JSON.stringify(this.templates));
    }

    getAllTemplates() {
        return this.templates;
    }

    getTemplateById(id) {
        return this.templates.find(t => t.id === id);
    }

    addTemplate(template) {
        template.id = `tpl-custom-${Date.now()}`;
        this.templates.push(template);
        this.saveTemplates();
        return template;
    }

    deleteTemplate(id) {
        this.templates = this.templates.filter(t => t.id !== id);
        this.saveTemplates();
    }

    exportTemplates() {
        const dataStr = JSON.stringify(this.templates, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'letter-templates.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importTemplates(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (Array.isArray(imported)) {
                        this.templates = [...this.templates, ...imported];
                        this.saveTemplates();
                        resolve(imported.length);
                    } else {
                        reject(new Error('Invalid format'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }
}

export { TemplateManager, DEFAULT_TEMPLATES };
