// app.js - Main application entry point
import { CanvasManager } from './canvas.js';
import { EditorManager } from './editor.js';
import { TemplateManager } from './templates.js';
import { exportToPDF } from './pdfExport.js';
import { applyTheme, toggleTheme, currentTheme } from './themes.js';
import { setLanguage, getTranslation, currentLang } from './i18n.js';

class App {
    constructor() {
        // State management
        this.state = {
            header: {
                organization: '',
                logoUrl: '',
                date: new Date().toISOString().split('T')[0],
                attachment: false,
                letterNumber: ''
            },
            bodyContent: '',
            rectangles: {},
            currentTemplateId: null
        };

        // Undo/Redo stacks for property changes and header fields (not for Quill which has its own)
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 50;
        this.autosaveInterval = 30000; // 30 seconds

        // Initialize components
        this.canvasContainer = document.getElementById('a4-canvas');
        this.canvasManager = new CanvasManager(this.canvasContainer, this.state);
        this.canvasManager.onRectChange = (rect) => this.handleRectChange(rect);
        this.canvasManager.onSelect = (rect) => this.showRectProps(rect);

        // Editor for body
        const bodyRect = this.canvasManager.getRect('body');
        if (bodyRect) {
            // Need to create a container for Quill inside body rect
            const editorContainer = document.createElement('div');
            editorContainer.style.width = '100%';
            editorContainer.style.height = '100%';
            bodyRect.element.appendChild(editorContainer);
            this.editor = new EditorManager(editorContainer, document.getElementById('editor-toolbar'));
            this.editor.onContentChange = () => this.handleBodyChange();
        }

        // Templates
        this.templateManager = new TemplateManager();

        // Populate template select
        this.populateTemplateSelect();

        // Load saved state if exists
        this.loadSavedState();

        // Set initial language and theme
        const savedLang = localStorage.getItem('letter-lang') || 'en';
        setLanguage(savedLang);

        // Setup event listeners
        this.setupEventListeners();

        // Start autosave
        this.startAutosave();

        // Apply initial rectangle properties to UI
        this.showRectProps(this.canvasManager.getRect('header'));
        this.updateHeaderFieldsUI();
    }

    populateTemplateSelect() {
        const select = document.getElementById('template-select');
        select.innerHTML = '';
        // Option for no template
        const noOption = document.createElement('option');
        noOption.value = '';
        noOption.textContent = getTranslation('noTemplate');
        select.appendChild(noOption);

        this.templateManager.getAllTemplates().forEach(tpl => {
            const opt = document.createElement('option');
            opt.value = tpl.id;
            opt.textContent = tpl.name || tpl.id;
            select.appendChild(opt);
        });

        // Set current template if any
        if (this.state.currentTemplateId) {
            select.value = this.state.currentTemplateId;
        }
    }

    loadSavedState() {
        const saved = localStorage.getItem('letter-app-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                // Apply rectangles
                if (parsed.rectangles) {
                    this.canvasManager.setState({ rectangles: parsed.rectangles });
                }
                // Apply header fields
                this.applyHeaderFields(this.state.header);
                // Apply body content
                if (this.editor && this.state.bodyContent) {
                    this.editor.setHTML(this.state.bodyContent);
                }
                // Update UI
                this.updateHeaderFieldsUI();
                this.populateTemplateSelect();
            } catch (e) {
                console.warn('Failed to load saved state', e);
            }
        } else {
            // Load default template? Maybe first template
            const firstTpl = this.templateManager.getAllTemplates()[0];
            if (firstTpl) {
                this.applyTemplate(firstTpl.id);
            }
        }
    }

    saveState() {
        this.state.rectangles = this.canvasManager.getState().rectangles;
        if (this.editor) {
            this.state.bodyContent = this.editor.getHTML();
        }
        localStorage.setItem('letter-app-state', JSON.stringify(this.state));
    }

    startAutosave() {
        setInterval(() => {
            this.saveState();
        }, this.autosaveInterval);
    }

    // Header field handling
    updateHeaderFieldsUI() {
        document.getElementById('org-name').value = this.state.header.organization;
        document.getElementById('logo-url').value = this.state.header.logoUrl;
        document.getElementById('letter-date').value = this.state.header.date;
        document.getElementById('attachment').value = this.state.header.attachment ? 'true' : 'false';
        document.getElementById('letter-number').value = this.state.header.letterNumber;
        this.renderHeaderContent();
    }

    renderHeaderContent() {
        const headerRect = this.canvasManager.getRect('header');
        if (!headerRect) return;
        // Clear previous content
        const existing = headerRect.element.querySelector('.header-content');
        if (existing) existing.remove();

        const content = document.createElement('div');
        content.className = 'header-content';
        content.innerHTML = `
            <div class="header-left">
                <span class="header-date">${this.state.header.date}</span>
                <span class="header-attachment">${this.state.header.attachment ? 'Has attachment' : 'No attachment'}</span>
                <span class="header-number">${this.state.header.letterNumber}</span>
            </div>
            <div class="header-center">
                ${this.state.header.logoUrl ? `<img src="${this.state.header.logoUrl}" alt="Logo" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="header-right">
                <span class="header-org">${this.state.header.organization}</span>
            </div>
        `;
        headerRect.element.appendChild(content);
    }

    applyHeaderFields(headerData) {
        this.state.header = { ...this.state.header, ...headerData };
        this.updateHeaderFieldsUI();
    }

    handleHeaderInputChange() {
        this.state.header.organization = document.getElementById('org-name').value;
        this.state.header.logoUrl = document.getElementById('logo-url').value;
        this.state.header.date = document.getElementById('letter-date').value;
        this.state.header.attachment = document.getElementById('attachment').value === 'true';
        this.state.header.letterNumber = document.getElementById('letter-number').value;
        this.renderHeaderContent();
        this.pushUndoSnapshot();
        this.saveState();
    }

    // Rectangle change handling
    handleRectChange(rect) {
        this.saveState();
        this.pushUndoSnapshot();
    }

    showRectProps(rect) {
        if (!rect) return;
        document.getElementById('rect-select').value = rect.type;
        document.getElementById('fill-color').value = rect.props.fill;
        document.getElementById('border-color').value = rect.props.borderColor;
        document.getElementById('border-width').value = rect.props.borderWidth;
        document.getElementById('corner-radius').value = rect.props.cornerRadius;
    }

    handlePropertyChange() {
        const selectedRect = this.canvasManager.selectedRect;
        if (!selectedRect) return;
        const rectType = document.getElementById('rect-select').value;
        if (rectType !== selectedRect.type) {
            // Switch selection
            const target = this.canvasManager.getRect(rectType);
            if (target) this.canvasManager.selectRectangle(target);
            return;
        }
        const newProps = {
            fill: document.getElementById('fill-color').value,
            borderColor: document.getElementById('border-color').value,
            borderWidth: parseInt(document.getElementById('border-width').value) || 0,
            cornerRadius: parseInt(document.getElementById('corner-radius').value) || 0
        };
        selectedRect.updateProps(newProps);
        this.handleRectChange(selectedRect);
    }

    // Body content change
    handleBodyChange() {
        this.saveState();
        this.pushUndoSnapshot();
    }

    // Undo/Redo system for non-Quill changes
    pushUndoSnapshot() {
        const snapshot = JSON.stringify({
            header: this.state.header,
            rectangles: this.canvasManager.getState().rectangles
        });
        // Avoid duplicate consecutive snapshots
        if (this.undoStack.length === 0 || this.undoStack[this.undoStack.length - 1] !== snapshot) {
            this.undoStack.push(snapshot);
            if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const currentSnapshot = JSON.stringify({
            header: this.state.header,
            rectangles: this.canvasManager.getState().rectangles
        });
        this.redoStack.push(currentSnapshot);
        const prevSnapshot = this.undoStack.pop();
        const prevState = JSON.parse(prevSnapshot);
        this.state.header = prevState.header;
        this.canvasManager.setState({ rectangles: prevState.rectangles });
        this.updateHeaderFieldsUI();
        this.saveState();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const currentSnapshot = JSON.stringify({
            header: this.state.header,
            rectangles: this.canvasManager.getState().rectangles
        });
        this.undoStack.push(currentSnapshot);
        const nextSnapshot = this.redoStack.pop();
        const nextState = JSON.parse(nextSnapshot);
        this.state.header = nextState.header;
        this.canvasManager.setState({ rectangles: nextState.rectangles });
        this.updateHeaderFieldsUI();
        this.saveState();
    }

    // Template operations
    applyTemplate(templateId) {
        const template = this.templateManager.getTemplateById(templateId);
        if (!template) return;
        this.state.currentTemplateId = templateId;
        this.state.header = { ...template.header };
        this.applyHeaderFields(template.header);
        if (this.editor) {
            this.editor.setHTML(template.bodyHTML);
        }
        this.canvasManager.setState({ rectangles: template.rectangles });
        this.saveState();
        this.populateTemplateSelect();
    }

    saveCurrentAsTemplate() {
        const template = {
            name: `Custom Template ${Date.now()}`,
            type: 'custom',
            header: { ...this.state.header },
            bodyHTML: this.editor ? this.editor.getHTML() : '',
            rectangles: this.canvasManager.getState().rectangles
        };
        this.templateManager.addTemplate(template);
        this.populateTemplateSelect();
        // Show success message
        alert(getTranslation('saveTemplateSuccess'));
    }

    exportTemplates() {
        this.templateManager.exportTemplates();
    }

    importTemplates(file) {
        this.templateManager.importTemplates(file).then(count => {
            this.populateTemplateSelect();
            alert(getTranslation('importSuccess') + ` (${count})`);
        }).catch(err => {
            alert(getTranslation('importError'));
        });
    }

    // PDF export
    async handlePDFExport() {
        try {
            const filename = prompt('Enter filename:', 'letter.pdf') || 'letter.pdf';
            const canvas = document.getElementById('a4-canvas');
            await exportToPDF(canvas, filename);
        } catch (error) {
            alert(getTranslation('pdfExportError'));
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('btn-theme').addEventListener('click', toggleTheme);

        // Language toggle
        document.getElementById('btn-lang').addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'fa' : 'en';
            setLanguage(newLang);
            // After language change, update UI texts that are not data-i18n (like template names? they stay same)
            this.populateTemplateSelect();
        });

        // Undo/Redo buttons
        document.getElementById('btn-undo').addEventListener('click', () => {
            if (this.editor) {
                this.editor.undo();
            }
            this.undo();
        });
        document.getElementById('btn-redo').addEventListener('click', () => {
            if (this.editor) {
                this.editor.redo();
            }
            this.redo();
        });

        // Template select
        document.getElementById('template-select').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                this.applyTemplate(val);
            }
        });

        // Save template
        document.getElementById('btn-save-template').addEventListener('click', () => {
            this.saveCurrentAsTemplate();
        });

        // Export/Import templates
        document.getElementById('btn-export-import').addEventListener('click', () => {
            // Show a simple prompt to choose export or import? We'll just open file input for import and a separate export button maybe.
            // For simplicity, we'll show a dialog with two options.
            const choice = confirm('Export templates? Click OK to export, Cancel to import.');
            if (choice) {
                this.exportTemplates();
            } else {
                document.getElementById('import-file').click();
            }
        });
        document.getElementById('import-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importTemplates(e.target.files[0]);
            }
        });

        // PDF export
        document.getElementById('btn-export-pdf').addEventListener('click', () => {
            this.handlePDFExport();
        });

        // Print
        document.getElementById('btn-print').addEventListener('click', () => {
            window.print();
        });

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            const currentZoom = this.canvasManager.getZoom();
            const newZoom = Math.min(2, currentZoom + 0.1);
            this.canvasManager.setZoom(newZoom);
        });
        document.getElementById('zoom-out').addEventListener('click', () => {
            const currentZoom = this.canvasManager.getZoom();
            const newZoom = Math.max(0.3, currentZoom - 0.1);
            this.canvasManager.setZoom(newZoom);
        });

        // Rectangle selection
        document.getElementById('rect-select').addEventListener('change', (e) => {
            const type = e.target.value;
            const rect = this.canvasManager.getRect(type);
            if (rect) this.canvasManager.selectRectangle(rect);
        });

        // Property inputs
        ['fill-color', 'border-color', 'border-width', 'corner-radius'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.handlePropertyChange());
        });

        // Header field inputs
        ['org-name', 'logo-url', 'letter-date', 'attachment', 'letter-number'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.handleHeaderInputChange());
        });

        // Editor toolbar is handled by Quill; we need to map font family and size selects
        document.getElementById('font-family').addEventListener('change', (e) => {
            if (this.editor) this.editor.setFontFamily(e.target.value);
        });
        document.getElementById('font-size').addEventListener('change', (e) => {
            if (this.editor) this.editor.setFontSize(e.target.value);
        });

        // Global click to deselect rectangles? Not needed.
    }
}

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
