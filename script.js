var stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth - 40,
    height: window.innerHeight
});

var layer = new Konva.Layer();
stage.add(layer);

var transformer = new Konva.Transformer({
    anchorSize: 20,
    rotateAnchorOffset: 30,
    borderDash: [3, 3],
    keepRatio: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
});
layer.add(transformer);

function updateActiveElement(node) {
    layer.add(transformer);
    transformer.nodes([node]);
    layer.draw();
}

stage.on('click', function(e) {
    if (e.target === stage) {
        transformer.nodes([]);
        layer.draw();
        return;
    }
    if (e.target.hasName('selectable')) {
        updateActiveElement(e.target);
    }
});

document.getElementById('container').addEventListener('dragenter', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

document.getElementById('container').addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

document.getElementById('container').addEventListener('drop', function(e) {
    e.preventDefault();
    var jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
        var imageData = JSON.parse(jsonData);
        var img = new Image();
        img.onload = function() {
            var stageBox = stage.container().getBoundingClientRect();
            var scale = stage.scaleX();
            var x = (e.clientX - stageBox.left) / scale;
            var y = (e.clientY - stageBox.top) / scale;
            drawImage(img, x, y);
        };
        img.src = imageData.src;
    }
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    addToAssetsPanel(img);
                    drawImage(img, stage.width() / 2, stage.height() / 2); // Center of stage
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function addToAssetsPanel(img) {
    var assetContainer = document.createElement('div');
    assetContainer.classList.add('asset-container');
    assetContainer.classList.add(document.body.style.backgroundColor === '#1b1a18' ? 'dark-mode' : 'light-mode');
    assetContainer.style.backgroundColor = document.body.style.backgroundColor;

    var thumbnail = new Image();
    thumbnail.src = img.src;
    thumbnail.classList.add('asset-thumbnail');
    thumbnail.draggable = true;

    var deleteBtn = document.createElement('button');
    deleteBtn.classList.add('asset-delete-btn');
    deleteBtn.innerHTML = 'X';
    deleteBtn.onclick = function(e) {
        e.stopPropagation(); // Prevent triggering drag start
        assetContainer.remove();
    };

    thumbnail.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('application/json', JSON.stringify({
            src: img.src,
            width: img.width,
            height: img.height
        }));
        // Create a scaled-down version of the image for the drag preview
        var maxSize = 200; // Should match the maxSize in drawImage
        var scale = Math.min(maxSize / img.width, maxSize / img.height);
        var dragIcon = document.createElement('canvas');
        dragIcon.width = img.width * scale;
        dragIcon.height = img.height * scale;
        var ctx = dragIcon.getContext('2d');
        ctx.drawImage(img, 0, 0, dragIcon.width, dragIcon.height);
        e.dataTransfer.setDragImage(dragIcon, dragIcon.width / 2, dragIcon.height / 2);
    });

    assetContainer.appendChild(thumbnail);
    assetContainer.appendChild(deleteBtn);
    document.getElementById('assetsList').appendChild(assetContainer);
}

function drawImage(imageObj, x, y) {
    var imgWidth = imageObj.width;
    var imgHeight = imageObj.height;
    var maxSize = 200; // Maximum width or height for the image
    var scale = Math.min(maxSize / imgWidth, maxSize / imgHeight);

    var image = new Konva.Image({
        image: imageObj,
        x: x - (imgWidth * scale / 2), // Center the image on the cursor
        y: y - (imgHeight * scale / 2),
        width: imgWidth * scale,
        height: imgHeight * scale,
        draggable: true,
        name: 'selectable'
    });

    layer.add(image);
    layer.draw();
}

function changeBackgroundColor(color) {
    document.body.style.backgroundColor = color;
    document.getElementById('container').style.backgroundColor = color;
    
    // Adjust toolbar and assets panel color
    var toolbar = document.getElementById('toolbar');
    var assetsPanel = document.getElementById('assetsPanel');
    var assetsPanelToggle = document.getElementById('assetsPanelToggle');
    var assetsPanelTitle = document.getElementById('assetsPanelTitle');
    var toolbarButtons = document.querySelectorAll('.toolbar-button');
    var assetContainers = document.querySelectorAll('.asset-container');
    var assetThumbnails = document.querySelectorAll('.asset-thumbnail');
    var assetDeleteBtns = document.querySelectorAll('.asset-delete-btn');
    var canvasTexts = stage.find('Text');
    
    var isDarkMode = color === '#37342e' || color === '#1b1a18';
    
    if (isDarkMode) {
        // Dark mode
        toolbar.style.backgroundColor = '#2a2826';
        assetsPanel.style.backgroundColor = '#2a2826';
        assetsPanelToggle.style.backgroundColor = '#2a2826';
        assetsPanelTitle.style.color = '#e0e0e0';
        toolbarButtons.forEach(button => button.classList.add('dimmed-icon'));
        assetContainers.forEach(container => {
            container.classList.remove('light-mode');
            container.classList.add('dark-mode');
            container.style.backgroundColor = color;
        });
        assetThumbnails.forEach(thumbnail => {
            thumbnail.style.backgroundColor = color;
        });
        assetDeleteBtns.forEach(btn => {
            btn.style.backgroundColor = '#d32f2f';
            btn.style.color = '#e0e0e0';
        });
        canvasTexts.forEach(text => {
            if (text.fill() === '#000000') {
                text.fill('#e0e0e0');
            }
        });
    } else {
        // Light mode
        toolbar.style.backgroundColor = '#e0ded7';
        assetsPanel.style.backgroundColor = '#e0ded7';
        assetsPanelToggle.style.backgroundColor = '#e0ded7';
        assetsPanelTitle.style.color = '#333333';
        toolbarButtons.forEach(button => button.classList.remove('dimmed-icon'));
        assetContainers.forEach(container => {
            container.classList.remove('dark-mode');
            container.classList.add('light-mode');
            container.style.backgroundColor = color;
        });
        assetThumbnails.forEach(thumbnail => {
            thumbnail.style.backgroundColor = color;
        });
        assetDeleteBtns.forEach(btn => {
            btn.style.backgroundColor = '#ff5252';
            btn.style.color = '#ffffff';
        });
        canvasTexts.forEach(text => {
            if (text.fill() === '#e0e0e0') {
                text.fill('#000000');
            }
        });
    }
    
    document.getElementById('textPreview').style.backgroundColor = color;
    
    layer.batchDraw();
}

document.getElementById('addText').addEventListener('click', function() {
    document.getElementById('textPopup').style.display = 'block';
});

document.getElementById('addTextButton').addEventListener('click', function() {
    var text = document.getElementById('popupTextInput').value;
    var color = document.getElementById('colorPicker').value;
    var font = document.getElementById('fontPicker').value;
    var fontSize = document.getElementById('fontSizeSlider').value;
    addText(text, color, font, fontSize);
});

function addText(text, color, font, fontSize) {
    var isDarkMode = document.body.style.backgroundColor === '#37342e' || document.body.style.backgroundColor === '#1b1a18';
    var textNode = new Konva.Text({
        text: text,
        x: 50,
        y: 50,
        fontSize: parseInt(fontSize),
        fontFamily: font,
        fill: color === '#000000' ? '#ffffff' : color, // Use white if the color is black
        draggable: true,
        name: 'selectable'
    });

    layer.add(textNode);
    layer.draw();
}

function closeTextPopup() {
    document.getElementById('textPopup').style.display = 'none';
    document.getElementById('popupTextInput').value = '';
}

document.getElementById('cancelTextButton').addEventListener('click', closeTextPopup);

document.getElementById('increaseSize').addEventListener('click', function() {
    if (transformer.nodes().length > 0) {
        var node = transformer.nodes()[0];
        var newScale = node.scaleX() * 1.1;
        node.scaleX(newScale);
        node.scaleY(newScale);
        transformer.forceUpdate();
        layer.draw();
    }
});

document.getElementById('decreaseSize').addEventListener('click', function() {
    if (transformer.nodes().length > 0) {
        var node = transformer.nodes()[0];
        var newScale = node.scaleX() * 0.9;
        node.scaleX(newScale);
        node.scaleY(newScale);
        transformer.forceUpdate();
        layer.draw();
    }
});

// Function to delete the selected item
function deleteSelectedItem() {
    if (transformer.nodes().length > 0) {
        var node = transformer.nodes()[0];
        node.destroy();
        transformer.nodes([]);
        layer.draw();
    }
}

// Event listener for the delete button in the app
document.getElementById('deleteItem').addEventListener('click', deleteSelectedItem);

// Event listener for the 'Delete' key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent the default action (e.g., navigating back in some browsers)
        e.preventDefault();
        deleteSelectedItem();
    }
});

// Global variables to store animation settings
let shakeSettings = { speed: 0.7, repetitions: 5, distance: 100 };
let circleSettings = { speed: 1, repetitions: 5, radius: 100 };

document.addEventListener('DOMContentLoaded', function() {
    const shakeButton = document.getElementById('shakeButton');
    const circleButton = document.getElementById('circleButton');
    const settingsButton = document.getElementById('animationSettings');
    const settingsMenu = document.getElementById('animationSettingsMenu');
    const saveSettingsButton = document.getElementById('saveAnimationSettings');
    const closeSettingsButton = document.getElementById('closeAnimationSettings');

    if (shakeButton) {
        shakeButton.addEventListener('click', () => applyAnimation('shake'));
    }

    if (circleButton) {
        circleButton.addEventListener('click', () => applyAnimation('circle'));
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            updateSettingsInputs();
            settingsMenu.style.display = 'block';
        });
    }

    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', saveAnimationSettings);
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => {
            settingsMenu.style.display = 'none';
        });
    }

    // Initialize settings inputs
    updateSettingsInputs();
});

function applyAnimation(type) {
    if (transformer.nodes().length > 0) {
        const node = transformer.nodes()[0];
        if (type === 'shake') {
            shakeElement(node, shakeSettings.speed, shakeSettings.repetitions, shakeSettings.distance);
        } else if (type === 'circle') {
            moveInCircle(node, circleSettings.speed, circleSettings.repetitions, circleSettings.radius);
        }
    }
}

function saveAnimationSettings() {
    shakeSettings = {
        speed: parseFloat(document.getElementById('shakeSpeed').value),
        repetitions: parseInt(document.getElementById('shakeRepetitions').value),
        distance: parseInt(document.getElementById('shakeDistance').value)
    };

    circleSettings = {
        speed: parseFloat(document.getElementById('circleSpeed').value),
        repetitions: parseInt(document.getElementById('circleRepetitions').value),
        radius: parseInt(document.getElementById('circleRadius').value)
    };

    updateSettingsInputs();
    document.getElementById('animationSettingsMenu').style.display = 'none';
}

function updateSettingsInputs() {
    document.getElementById('shakeSpeed').value = shakeSettings.speed;
    document.getElementById('shakeSpeedValue').textContent = shakeSettings.speed.toFixed(1);
    document.getElementById('shakeRepetitions').value = shakeSettings.repetitions;
    document.getElementById('shakeDistance').value = shakeSettings.distance;
    document.getElementById('shakeDistanceValue').textContent = shakeSettings.distance;

    document.getElementById('circleSpeed').value = circleSettings.speed;
    document.getElementById('circleSpeedValue').textContent = circleSettings.speed;
    document.getElementById('circleRepetitions').value = circleSettings.repetitions;
    document.getElementById('circleRadius').value = circleSettings.radius;
    document.getElementById('circleRadiusValue').textContent = circleSettings.radius;
}

// Update the existing animation functions to use these settings
function shakeElement(node, speed = shakeSettings.speed, repetitions = shakeSettings.repetitions, amplitude = shakeSettings.distance) {
    const period = 400 / speed; // Time for one complete shake
    const duration = period * repetitions;
    const startTime = new Date().getTime();

    var shakeAnimation = new Konva.Animation(function(frame) {
        const elapsed = new Date().getTime() - startTime;
        let t = elapsed / duration;
        if (t > 1) t = 1;
        
        // Easing function for smoother start and stop
        const easeT = Math.sin(t * Math.PI);
        
        // Calculate the current repetition
        const currentRepetition = t * repetitions;
        
        // Sine wave for shake effect
        const dx = amplitude * Math.sin(currentRepetition * 2 * Math.PI) * easeT;
        
        node.x(node.getAttr('originalX') + dx);
        
        if (t >= 1) {
            shakeAnimation.stop();
            // Smoothly return to original position
            new Konva.Tween({
                node: node,
                duration: 0.2,
                x: node.getAttr('originalX'),
                easing: Konva.Easings.EaseOut
            }).play();
        }
    }, layer);

    node.setAttr('originalX', node.x());
    shakeAnimation.start();
}

function moveInCircle(node, speed = circleSettings.speed, rotations = circleSettings.repetitions, radius = circleSettings.radius) {
    const duration = (2500 / speed) * rotations; // Reduced base duration for faster default speed
    const centerX = node.x();
    const centerY = node.y();
    const startTime = new Date().getTime();
    const startAngle = Math.atan2(node.y() - centerY, node.x() - centerX);

    var circleAnimation = new Konva.Animation(function(frame) {
        const elapsed = new Date().getTime() - startTime;
        let t = elapsed / duration;
        if (t > 1) t = 1;
        
        // Easing function for smooth start and stop
        const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        // Calculate angle based on number of rotations
        const angle = startAngle + rotations * 2 * Math.PI * t;
        
        // Apply easing to the radius
        const currentRadius = radius * Math.sin(easeT * Math.PI);
        
        // Calculate new position
        const x = centerX + currentRadius * Math.cos(angle);
        const y = centerY + currentRadius * Math.sin(angle);
        
        node.x(x);
        node.y(y);
        
        if (t >= 1) {
            circleAnimation.stop();
        }
    }, layer);

    circleAnimation.start();
}

// Add event listeners for live preview updates in the settings menu
['shakeSpeed', 'shakeDistance', 'circleSpeed', 'circleRadius'].forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        document.getElementById(id + 'Value').textContent = this.value;
    });
});

// Toggle assets panel
document.getElementById('assetsPanelToggle').addEventListener('click', function() {
    var assetsPanel = document.getElementById('assetsPanel');
    var container = document.getElementById('container');
    assetsPanel.classList.toggle('expanded');
    container.classList.toggle('assets-panel-expanded');
    this.innerHTML = assetsPanel.classList.contains('expanded') ? '▶' : '◀';
    resizeStage();
});

function resizeStage() {
    var assetsPanel = document.getElementById('assetsPanel');
    var panelWidth = assetsPanel.classList.contains('expanded') ? 150 : 0;
    stage.width(window.innerWidth - 40 - panelWidth); // Changed from 50 to 40
    stage.height(window.innerHeight);
    stage.draw();
}

window.addEventListener('resize', resizeStage);
resizeStage(); // Call once to set initial size

// Set initial background color
changeBackgroundColor('#1b1a18');

// Live preview update
function updatePreview() {
    const text = document.getElementById('popupTextInput').value || 'Preview Text';
    const color = document.getElementById('colorPicker').value;
    const font = document.getElementById('fontPicker').value;
    const fontSize = document.getElementById('fontSizeSlider').value;
    
    const preview = document.getElementById('textPreview');
    preview.style.fontFamily = font;
    preview.style.color = color === '#000000' ? '#ffffff' : color; // Use white if the color is black
    preview.style.fontSize = `${fontSize}px`;
    preview.textContent = text;
    
    // Set the preview background to match the canvas
    preview.style.backgroundColor = document.body.style.backgroundColor;
    
    document.getElementById('fontSizeValue').textContent = fontSize;
}

// Event listeners for preview updates
document.getElementById('popupTextInput').addEventListener('input', updatePreview);
document.getElementById('colorPicker').addEventListener('input', updatePreview);
document.getElementById('fontPicker').addEventListener('change', updatePreview);
document.getElementById('fontSizeSlider').addEventListener('input', updatePreview);

// Make the popup draggable
let isDragging = false;
let offsetX, offsetY;

const textPopup = document.getElementById('textPopup');
const textPopupTitleBar = document.getElementById('textPopupTitleBar');
const textInput = document.getElementById('popupTextInput'); // Make sure this ID matches your input element

textPopupTitleBar.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    if (e.target === textPopupTitleBar || e.target.parentNode === textPopupTitleBar) {
        isDragging = true;
        
        // Get the current position of the popup
        const rect = textPopup.getBoundingClientRect();
        
        // Calculate the offset between the mouse position and the popup's current position
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Remove any existing transform
        textPopup.style.transform = 'none';
        
        // Set the initial position explicitly
        textPopup.style.left = rect.left + 'px';
        textPopup.style.top = rect.top + 'px';
        
        e.preventDefault();
    }
}

function drag(e) {
    if (isDragging) {
        requestAnimationFrame(() => {
            // Calculate the new position of the popup based on the mouse movement
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            textPopup.style.left = newX + 'px';
            textPopup.style.top = newY + 'px';
        });
    }
}

function dragEnd() {
    isDragging = false;
}

// Prevent default drag behavior on the title bar
textPopupTitleBar.addEventListener('dragstart', (e) => e.preventDefault());

// Allow normal text input behavior
textInput.addEventListener('keydown', (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up
});

// Initial preview update
updatePreview();

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('textPopup').style.display !== 'none') {
        document.getElementById('addTextButton').click();
    } else if (e.key === 'Escape' && document.getElementById('textPopup').style.display !== 'none') {
        document.getElementById('cancelTextButton').click();
    }
});

// Make the preview draggable
const textPreview = document.getElementById('textPreview');
const canvas = document.getElementById('container'); // Make sure this matches your canvas element ID

textPreview.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'preview');
});

// Allow dropping on the canvas
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    if (data === 'preview') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addTextFromPreview(x, y);
    }
});

function addTextFromPreview(x, y) {
    const text = document.getElementById('popupTextInput').value || 'Preview Text';
    const color = document.getElementById('colorPicker').value;
    const font = document.getElementById('fontPicker').value;
    const fontSize = document.getElementById('fontSizeSlider').value;

    var textNode = new Konva.Text({
        text: text,
        x: x,
        y: y,
        fontSize: parseInt(fontSize),
        fontFamily: font,
        fill: color === '#000000' ? '#ffffff' : color, // Use white if the color is black
        draggable: true,
        name: 'selectable'
    });

    layer.add(textNode);
    layer.draw();
}

// Update the existing addText function to use the new addTextFromPreview function
function addText() {
    addTextFromPreview(50, 50); // Default position
    closeTextPopup();
}
                                                                                                                                                                                                                         