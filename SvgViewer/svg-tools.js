/*
Collection library for SVG images.
https://github.com/Nalahar/java-script
License GNU GPL 3.0 
*/

/**
 * Independent SVG Image viewer component.
 * The component generates its code inside passed container.
 * The old container content is cleaned out.
 */
class SvgViewer {

    /**
     * Main constructor.
     * @param {HTMLElement} containerElement element where the viewer is injected into.
     */
    constructor(containerElement) {
        if (containerElement == null) {
            throw 'containerElement is null';
        }

        // Event handlers
        this.onFileChangeHandler = this.onFileChange.bind(this);
        this.onFileLoadHandler = this.onFileLoad.bind(this);

        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        this.onMouseUpHandler = this.onMouseUp.bind(this);

        // UI elements
        this.containerElement = containerElement;
        this.createFileInput();

        // Transform properties
        this.translateX = 0;
        this.translateY = 0;
        this.scale = 1;
        this.mouseStartX = null;
        this.mouseStartY = null;
    }

    /**
     * Creates basic UI for file input.
     */
    createFileInput() {
        this.fileInput = document.createElement("input");
        this.fileInput.id = 'svg-file-input';
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*.svg';
        this.fileInput.addEventListener('change', this.onFileChangeHandler);
        //this.fileInput.onchange;

        let label = document.createElement('label');
        label.htmlFor = 'svg-file-input'
        label.innerText = 'Load file: '

        this.containerElement.appendChild(label);
        this.containerElement.appendChild(this.fileInput);
    }

    /**
     * Intercepts file input changes and starts SVG.xml file load.
     * @param {ProgressEvent} e 
     */
    onFileChange(e) {
        // this is for file input
        let fileInput = e.target;
        const selectedFile = fileInput.files[0];

        if (selectedFile) {
            let fileReader = new FileReader();
            fileReader.onload = this.onFileLoadHandler;
            fileReader.onerror = err => console.log(err);
            fileReader.readAsText(selectedFile);
        }
    }

    /**
     * Updates transform value on wrapper graphics.
     */
    updateTransform() {
        let newTransform = `translate(${this.translateX} ${this.translateY}) scale(${this.scale} ${this.scale})`;
        this.graphics.setAttribute('transform', newTransform);
    }

    /**
     * Parses and creates HTML visualization of loaded SVG XML file.
     * @param {ProgressEvent} e file reader load event.
     */
    onFileLoad(e) {
        let fileReader = e.target;

        let xmlDoc = document.createRange().createContextualFragment(fileReader.result);
        let loadedSvgContent = xmlDoc.querySelector('svg').children;

        // Create SVG element that we can wrap.
        let fragment = document.createRange().createContextualFragment(`
            <svg width="100%" height="100%" viewbox="0 0 1920 1080"
                style="border:orange; border-width:5px; border-style:solid; background=cyan;">
                <g transform="translate(0 0) scale(1 1)">
                    
                </g>
            </svg>
        `);

        this.svg = fragment.querySelector('svg');
        this.svg.onmousedown = this.onMouseDownHandler;

        // Add loaded content to wrapper.
        this.graphics = fragment.querySelector('g');
        for (let child of loadedSvgContent)
            this.graphics.appendChild(child);

        // Initialize parent container.
        let child
        while (child = this.containerElement.firstChild)
            child.remove();

        this.containerElement.appendChild(fragment);
    }

    /**
     * Starts SVG graphics transform updates.
     * @param {MouseEvent} e 
     */
    onMouseDown(e) {
        this.mouseStartX = e.pageX;
        this.mouseStartY = e.pageY;

        document.addEventListener('mousemove', this.onMouseMoveHandler);
        document.addEventListener('mouseup', this.onMouseUpHandler);
    }

    /**
     * Updates SVG graphics PAN transformation based on mouse delta movement.
     * @param {MouseEvent} e mouse event
     */
    onMouseMove(e) {

        let dx = e.pageX - this.mouseStartX;
        let dy = e.pageY - this.mouseStartY;

        this.mouseStartX = e.pageX;
        this.mouseStartY = e.pageY;

        if (e.ctrlKey) {
            // Zoom updates only

            let newScale = this.scale + dy * 0.01;
            if (newScale > 0)
                this.scale = newScale;
        }
        else {
            // Pan updates only
            this.translateX += dx;
            this.translateY += dy;
        }

        this.updateTransform();
    }

    /**
     * Finishes SVG graphics transformation.
     * Clears transformation state.
     * @param {MouseEvent} e mouse event
     */
    onMouseUp(e) {
        document.removeEventListener('mousemove', this.onMouseMoveHandler);
        document.removeEventListener('mouseup', this.onMouseUpHandler);
    }
}
