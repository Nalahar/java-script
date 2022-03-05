SVgViewer

Requirements:
* Self contained static page component.
* View SVG image.
* Pan SVG image.
* Zoom SVG image.

* Provide static *.svg file load and view.

Implementation:
* Pan is done by holding mouse button and then moving the mouse. The image will follow mouse movements.
* Zoom is done by holding CTRL key and mouse button and then moving the mouse. The image will zoom in/out based on Vertical (Y) mouse movement.

* Pan/zoom starts only if mouse is clicked on the SVG Image.
* Mouse is tracked on document level.
* It is possible to lose image (panned too far)
* To load new file, page has to be refreshed.

Future ideas:
* Inherit loaded SVG attributes (background color).
* Provide more fields to modify like view port.
* Transform reset button.
* Load images with drag and drop (removes the load file button).
* View multiple separate images at the same time.
* Drag and drop shown image to change its position on page for easier image comparison.
* Directory load with image preview on side and drag and drop to main view pane.