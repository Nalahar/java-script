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

        this.onInputScaleChangeHandler = this.onInputScaleChange.bind(this);
        this.onInputTranslateChangeHandler = this.onInputTranslateChange.bind(this);
        this.onInputWidthChangeHandler = this.onInputWidthChange.bind(this);
        this.onInputHeightChangeHandler = this.onInputHeightChange.bind(this);
        this.onInputViewBoxChangeHandler = this.onInputViewBoxChange.bind(this);

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
        let loadedSvg = xmlDoc.querySelector('svg');

        // Create SVG element that we can wrap.
        let fragment = document.createRange().createContextualFragment(`
            <svg width="100%" height="100%" viewBox="0 0 1920 1080"
                style="border:orange; border-width:5px; border-style:solid; background=cyan;">
                <g transform="translate(0 0) scale(1 1)">
                    
                </g>
            </svg>
        `);

        this.svg = fragment.querySelector('svg');
        this.svg.onmousedown = this.onMouseDownHandler;

        if (loadedSvg.hasAttribute('viewBox')) {
            this.svg.setAttribute('viewBox', loadedSvg.getAttribute('viewBox'));
        }
        if (loadedSvg.hasAttribute('width')) {
            this.svg.setAttribute('width', loadedSvg.getAttribute('width'));
        }
        if (loadedSvg.hasAttribute('height')) {
            this.svg.setAttribute('height', loadedSvg.getAttribute('height'));
        }

        // Add loaded content to wrapper.
        this.graphics = fragment.querySelector('g');
        let child;
        while (child = loadedSvg.firstChild)
            this.graphics.appendChild(child);

        // Initialize parent container.
        while (child = this.containerElement.firstChild)
            child.remove();

        let info = document.createRange().createContextualFragment(`
            <div>
                <label for="widthId">Width </label>
                <input id="widthId" type='text' />
    
                <label for="heightId">Height </label>
                <input id="heightId" type='text' />
    
                <label for="viewBoxId">ViewBox </label>
                <input id="viewboxId" type='text' />
            </div>
            <div>
                <label for="translationId">Translation </label>
                <input id="translationId" type='text' />
    
                <label for="scaleId">Scale </label>
                <input id="scaleId" type='text' />
            </div>
        `);

        this.widthInfo = info.getElementById('widthId');
        this.widthInfo.onchange = this.onInputWidthChangeHandler;

        this.heightInfo = info.getElementById('heightId');
        this.heightInfo.onchange = this.onInputHeightChangeHandler;

        this.viewBoxInfo = info.getElementById('viewboxId');
        this.viewBoxInfo.onchange = this.onInputViewBoxChangeHandler;

        this.translationInfo = info.getElementById('translationId');
        this.translationInfo.onchange = this.onInputTranslateChangeHandler;

        this.scaleInfo = info.getElementById('scaleId');
        this.scaleInfo.onchange = this.onInputScaleChangeHandler;

        this.updateInformation();

        this.containerElement.appendChild(info);
        this.containerElement.appendChild(fragment);
    }

    /**
     * Updates information fields for svg viewbox and transform status.
     */
    updateInformation() {
        this.widthInfo.value = this.svg.getAttribute('width');
        this.heightInfo.value = this.svg.getAttribute('height');
        this.viewBoxInfo.value = this.svg.getAttribute('viewBox');

        this.translationInfo.value = `${this.translateX} ${this.translateY}`;
        this.scaleInfo.value = this.scale;
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
        this.updateInformation();
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

    /**
     * Handles input for width change.
     * @param {MouseEvent} e input change event
     */
    onInputWidthChange(e) {
        console.log(e);

        this.svg.setAttribute('width', e.target.value);
        this.updateInformation();
    }

    /**
     * Handles input for height change.
     * @param {MouseEvent} e input change event
     */
    onInputHeightChange(e) {
        console.log(e);

        this.svg.setAttribute('height', e.target.value);
        this.updateInformation();
    }

    /**
     * Handles input for viewBox change.
     * @param {MouseEvent} e input change event
     */
    onInputViewBoxChange(e) {
        console.log(e);

        this.svg.setAttribute('viewBox', e.target.value);
        this.updateInformation();
    }

    /**
     * Handles input for scale change.
     * @param {MouseEvent} e input change event
     */
    onInputScaleChange(e) {
        console.log(e);

        let newScale = parseInt(e.target.value);

        if (newScale > 0 && newScale < 20) {
            this.scale = newScale;
            this.updateTransform();
        }
        else {
            e.target.value = this.scale;
        }
    }

    /**
     * Handles input for translate change.
     * @param {MouseEvent} e input change event
     */
    onInputTranslateChange(e) {
        console.log(e);

        let splits = e.target.value.split(' ');

        if (splits.length != 2) {
            e.target.value = `${this.translateX} ${this.translateY}`;
            return;
        }

        let x = parseInt(splits[0]);
        let y = parseInt(splits[1]);

        if (isFinite(x) && isFinite(y)) {
            this.translateX = x;
            this.translateY = y;
            this.updateTransform();
        }
        else {
            e.target.value = `${this.translateX} ${this.translateY}`;
        }
    }
}
