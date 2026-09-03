// editor.js - Rich text editor for body rectangle
import { getTranslation } from './i18n.js';

class EditorManager {
    constructor(bodyRectElement, toolbarElement) {
        this.bodyRectElement = bodyRectElement;
        this.toolbarElement = toolbarElement;
        this.quill = null;
        this.undoStack = [];
        this.redoStack = [];
        this.isUndoRedo = false;
        this.init();
    }

    init() {
        // Configure Quill with custom toolbar
        const toolbarOptions = {
            container: this.toolbarElement,
            handlers: {
                // We'll let Quill handle default
            }
        };

        this.quill = new Quill(this.bodyRectElement, {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
                history: {
                    delay: 500,
                    maxStack: 100,
                    userOnly: true
                }
            },
            placeholder: 'Write your letter...'
        });

        // Load saved content if any
        const savedContent = localStorage.getItem('letter-body-content');
        if (savedContent) {
            this.quill.root.innerHTML = savedContent;
        }

        // Listen to text changes
        this.quill.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                this.handleTextChange();
            }
        });
    }

    handleTextChange() {
        // Debounce saving
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveContent();
            if (this.onContentChange) this.onContentChange();
        }, 300);
    }

    saveContent() {
        const html = this.quill.root.innerHTML;
        localStorage.setItem('letter-body-content', html);
    }

    getHTML() {
        return this.quill.root.innerHTML;
    }

    setHTML(html) {
        this.quill.root.innerHTML = html;
        this.saveContent();
    }

    // Undo/Redo integrated with Quill history
    undo() {
        this.quill.history.undo();
    }

    redo() {
        this.quill.history.redo();
    }

    // Set formatting on selection
    format(format, value) {
        this.quill.format(format, value);
    }

    // Set font family/size etc via select
    setFontFamily(font) {
        this.quill.format('font', font);
    }

    setFontSize(size) {
        this.quill.format('size', size);
    }

    // Save editor state for undo/redo of rectangle changes? We'll use snapshot approach elsewhere.
}

export { EditorManager };
