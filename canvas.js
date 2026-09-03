// canvas.js - A4 canvas and rectangle management
import { getTranslation } from './i18n.js';

class CustomRectangle {
    constructor(id, type, initialProps = {}) {
        this.id = id;
        this.type = type; // 'header' or 'body'
        this.element = document.createElement('div');
        this.element.className = `rect ${type}-rect`;
        this.element.dataset.rectId = id;
        this.element.dataset.type = type;
        
        // Default properties
        this.props = {
            x: initialProps.x || 20,
            y: initialProps.y || 20,
            width: initialProps.width || (type === 'header' ? 170 : 170),
            height: initialProps.height || (type === 'header' ? 30 : 220),
            fill: initialProps.fill || '#ffffff',
            borderColor: initialProps.borderColor || '#000000',
            borderWidth: initialProps.borderWidth || 2,
            cornerRadius: initialProps.cornerRadius || 0,
            zIndex: type === 'header' ? 2 : 1
        };
        
        this.selected = false;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeDir = null;
        this.startMousePos = null;
        this.startRect = null;
        this.onChange = null; // callback for state updates

        // Create resize handles
        this.handles = {};
        ['nw', 'ne', 'sw', 'se'].forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${dir}`;
            this.handles[dir] = handle;
            this.element.appendChild(handle);
        });

        this.applyProps();
        this.setupEvents();
        
        // If body rectangle, it will contain Quill editor; initialized elsewhere.
        if (type === 'body') {
            this.element.classList.add('body-rect');
        }
    }

    applyProps() {
        const { x, y, width, height, fill, borderColor, borderWidth, cornerRadius, zIndex } = this.props;
        this.element.style.left = `${x}mm`;
        this.element.style.top = `${y}mm`;
        this.element.style.width = `${width}mm`;
        this.element.style.height = `${height}mm`;
        this.element.style.backgroundColor = fill;
        this.element.style.borderColor = borderColor;
        this.element.style.borderWidth = `${borderWidth}px`;
        this.element.style.borderRadius = `${cornerRadius}px`;
        this.element.style.zIndex = zIndex;
        this.element.style.setProperty('--rectangle-fill', fill);
        this.element.style.setProperty('--rectangle-border', borderColor);
    }

    updateProps(newProps) {
        this.props = { ...this.props, ...newProps };
        this.applyProps();
        if (this.onChange) this.onChange(this);
    }

    setSelected(selected) {
        this.selected = selected;
        this.element.classList.toggle('selected', selected);
    }

    setupEvents() {
        // Drag
        this.element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) return;
            if (e.button !== 0) return;
            this.isDragging = true;
            this.startMousePos = { x: e.clientX, y: e.clientY };
            this.startRect = { x: this.props.x, y: this.props.y };
            this.element.style.cursor = 'grabbing';
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.onDragEnd);
            e.preventDefault();
        });

        // Resize handles
        Object.entries(this.handles).forEach(([dir, handle]) => {
            handle.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                this.isResizing = true;
                this.resizeDir = dir;
                this.startMousePos = { x: e.clientX, y: e.clientY };
                this.startRect = { ...this.props };
                document.addEventListener('mousemove', this.onResize);
                document.addEventListener('mouseup', this.onResizeEnd);
                e.stopPropagation();
                e.preventDefault();
            });
        });

        // Select on click
        this.element.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.select();
            }
        });
    }

    onDrag = (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.startMousePos.x;
        const dy = e.clientY - this.startMousePos.y;
        const newX = Math.max(0, Math.min(210 - this.props.width, this.startRect.x + dx / 3.78)); // mm approx from px
        const newY = Math.max(0, Math.min(297 - this.props.height, this.startRect.y + dy / 3.78));
        this.updateProps({ x: newX, y: newY });
    };

    onDragEnd = () => {
        this.isDragging = false;
        this.element.style.cursor = 'move';
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
    };

    onResize = (e) => {
        if (!this.isResizing) return;
        const dx = (e.clientX - this.startMousePos.x) / 3.78;
        const dy = (e.clientY - this.startMousePos.y) / 3.78;
        const { x, y, width, height } = this.startRect;
        let newX = x, newY = y, newWidth = width, newHeight = height;

        switch (this.resizeDir) {
            case 'nw':
                newX = Math.min(x + width - 10, x + dx);
                newY = Math.min(y + height - 10, y + dy);
                newWidth = width - (newX - x);
                newHeight = height - (newY - y);
                break;
            case 'ne':
                newY = Math.min(y + height - 10, y + dy);
                newWidth = Math.max(10, width + dx);
                newHeight = height - (newY - y);
                break;
            case 'sw':
                newX = Math.min(x + width - 10, x + dx);
                newWidth = width - (newX - x);
                newHeight = Math.max(10, height + dy);
                break;
            case 'se':
                newWidth = Math.max(10, width + dx);
                newHeight = Math.max(10, height + dy);
                break;
        }
        this.updateProps({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    onResizeEnd = () => {
        this.isResizing = false;
        this.resizeDir = null;
        document.removeEventListener('mousemove', this.onResize);
        document.removeEventListener('mouseup', this.onResizeEnd);
    };

    select() {
        // Deselect others? We'll let canvas manager handle.
        if (this.onSelect) this.onSelect(this);
        this.setSelected(true);
    }

    getState() {
        return {
            id: this.id,
            type: this.type,
            props: { ...this.props }
        };
    }

    setState(state) {
        this.props = { ...this.props, ...state.props };
        this.applyProps();
    }
}

class CanvasManager {
    constructor(container, state = {}) {
        this.container = container;
        this.rectangles = new Map(); // id -> CustomRectangle
        this.selectedRect = null;
        this.onRectChange = null; // callback when any rectangle changes
        this.zoom = 1;
        this.initFromState(state);
    }

    initFromState(state) {
        const { header, body } = state.rectangles || {};
        // Create header and body if not exist
        if (!this.rectangles.has('header') && header) {
            this.addRectangle('header', 'header', header.props);
        }
        if (!this.rectangles.has('body') && body) {
            this.addRectangle('body', 'body', body.props);
        }
        // If no state, create defaults
        if (!this.rectangles.has('header')) {
            this.addRectangle('header', 'header', {
                x: 20, y: 20, width: 170, height: 30,
                fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0
            });
        }
        if (!this.rectangles.has('body')) {
            this.addRectangle('body', 'body', {
                x: 20, y: 60, width: 170, height: 200,
                fill: '#ffffff', borderColor: '#000000', borderWidth: 2, cornerRadius: 0
            });
        }
    }

    addRectangle(id, type, props) {
        const rect = new CustomRectangle(id, type, props);
        rect.onChange = () => this.handleRectChange(rect);
        rect.onSelect = (r) => this.selectRectangle(r);
        this.container.appendChild(rect.element);
        this.rectangles.set(id, rect);
        return rect;
    }

    handleRectChange(rect) {
        if (this.onRectChange) this.onRectChange(rect);
    }

    selectRectangle(rect) {
        if (this.selectedRect) this.selectedRect.setSelected(false);
        this.selectedRect = rect;
        rect.setSelected(true);
        // Notify for properties panel
        if (this.onSelect) this.onSelect(rect);
    }

    getRect(id) {
        return this.rectangles.get(id);
    }

    getState() {
        const state = { rectangles: {} };
        this.rectangles.forEach((rect, id) => {
            state.rectangles[id] = rect.getState();
        });
        return state;
    }

    setState(state) {
        if (!state.rectangles) return;
        for (const [id, rectState] of Object.entries(state.rectangles)) {
            const rect = this.rectangles.get(id);
            if (rect) {
                rect.setState(rectState);
            } else {
                this.addRectangle(id, rectState.type, rectState.props);
            }
        }
    }

    setZoom(zoom) {
        this.zoom = zoom;
        this.container.style.transform = `scale(${zoom})`;
        this.container.style.transformOrigin = 'top left';
        // Update zoom display
        const zoomLabel = document.getElementById('zoom-level');
        if (zoomLabel) zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    }

    getZoom() {
        return this.zoom;
    }

    // Convert mm to px for interaction; we can store mm but use CSS mm which scales with zoom? We'll rely on CSS transform.
}

export { CustomRectangle, CanvasManager };
