// Restore the constant elements
const board = document.getElementById('board');
const colorCirclesContainer = document.getElementById('colorCircles');
const colorTrianglesContainer = document.getElementById('colorTriangles');
const palette = document.getElementById('palette');
const spriteNameInput = document.getElementById('sprite-name-input');
let shapeCounter = 0; // Initialize shapeCounter

document.addEventListener("DOMContentLoaded", function() {
    const leftPanel = document.querySelector('.left-panel');
    const colorPicker = document.querySelector('.color-picker');
    let addingShape = false; // Flag to prevent multiple additions

    // Show/Hide color-picker on left-panel click
    leftPanel.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent click event from bubbling up
        const isVisible = colorPicker.style.display === 'flex';
        colorPicker.style.display = isVisible ? 'none' : 'flex';

        // Emit event via TogetherJS
        TogetherJS.send({
            type: 'toggle-color-picker',
            isVisible: !isVisible
        });
    });

    // Prevent clicks inside the color picker from closing it
    colorPicker.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent click event from bubbling up
    });

    document.addEventListener('click', function(event) {
        const isClickInsidePanel = leftPanel.contains(event.target);
        const isClickInsideColorPicker = colorPicker.contains(event.target);
        const isClickOnShapeElement = event.target.classList.contains('color-circle') || 
                                      event.target.classList.contains('color-triangle') || 
                                      event.target.classList.contains('color-triangle-border') || 
                                      event.target.classList.contains('color');

        if (!isClickInsidePanel && !isClickInsideColorPicker && !isClickOnShapeElement) {
            colorPicker.style.display = 'none';

            // Emit event via TogetherJS
            TogetherJS.send({
                type: 'toggle-color-picker',
                isVisible: false
            });
        }
    });

    // Listen for TogetherJS toggle-color-picker event
    TogetherJS.hub.on('toggle-color-picker', function (msg) {
        if (!msg.sameUrl) return;

        const isVisible = colorPicker.style.display === 'flex';
        if (msg.isVisible !== isVisible) {
            colorPicker.style.display = msg.isVisible ? 'flex' : 'none';
        }
    });

    // Add event listeners for shape creation
    function handleShapeAddition(e, shapeType) {
        if (addingShape) return; // Block multiple additions
        addingShape = true;

        const color = getComputedStyle(e.target).backgroundColor;
        const spriteName = spriteNameInput.value.trim(); // Safeguard against undefined spriteName

        const uniqueId = `sprite-${shapeCounter++}`; // Generate a unique ID
        spawnShapeAtCursor(shapeType, color, spriteName, uniqueId);

        // Automatically close the side panel after adding the shape
        colorPicker.style.display = 'none';
        TogetherJS.send({
            type: 'toggle-color-picker',
            isVisible: false
        });
        addingShape = false;
    }

    colorCirclesContainer.addEventListener('click', (e) => handleShapeAddition(e, 'circle'));
    colorTrianglesContainer.addEventListener('click', (e) => handleShapeAddition(e, 'triangle'));
    palette.addEventListener('click', (e) => handleShapeAddition(e, 'square'));

    // Listen for TogetherJS spawn-shape event
    TogetherJS.hub.on('spawn-shape', function (msg) {
        if (!msg.sameUrl) return;

        // Check if the shape already exists before creating it
        if (!document.getElementById(msg.spriteId)) {
            spawnShapeAtCursor(msg.shapeType, msg.color, msg.spriteName, msg.spriteId);
        }
    });

    // Create color circles and triangles
    createColorCircles();
    createColorTriangles();
});

// Function to spawn a shape at the cursor position
function spawnShapeAtCursor(shapeType, color, spriteName, spriteId) {
    let newSprite;

    // Create shape based on type
    if (shapeType === 'circle') {
        newSprite = document.createElement('div');
        newSprite.className = 'sprite circle';
        newSprite.style.backgroundColor = color;
        newSprite.style.border = '2px solid #333';
        newSprite.style.borderRadius = '50%';
        newSprite.style.width = '50px';
        newSprite.style.height = '50px';
    } else if (shapeType === 'triangle') {
        newSprite = document.createElement('div');
        newSprite.className = 'sprite triangle-container';
        const innerTriangle = document.createElement('div');
        innerTriangle.className = 'triangle';
        innerTriangle.style.borderBottomColor = color;
        innerTriangle.style.display = 'block';
        newSprite.appendChild(innerTriangle);
    } else if (shapeType === 'square') {
        newSprite = document.createElement('div');
        newSprite.className = 'sprite square';
        newSprite.style.backgroundColor = color;
        newSprite.style.border = '2px solid #333';
        newSprite.style.borderRadius = '5px';
        newSprite.style.width = '50px';
        newSprite.style.height = '50px';
    }

    newSprite.id = spriteId; // Assign unique ID to the new shape
    // Handle overlay and controls
    const overlay = document.createElement('div');
    overlay.className = 'sprite-overlay';

    const trashcan = document.createElement('div');
    trashcan.className = 'trashcan';

    const rotation = document.createElement('div');
    rotation.className = 'rotation';

    newSprite.appendChild(overlay);
    newSprite.appendChild(trashcan);
    newSprite.appendChild(rotation);

    if (newSprite.classList.contains('triangle-container')) {
        trashcan.style.bottom = '-76px';
        trashcan.style.right = '-48px';
        rotation.style.bottom = '-76px';
        rotation.style.left = '-48px';
    } else {
        trashcan.style.bottom = '-20px';
        trashcan.style.right = '-20px';
        rotation.style.bottom = '-20px';
        rotation.style.left = '-20px';
    }

    // Adjust overlay position for triangles
    if (newSprite.classList.contains('triangle-container')) {
        overlay.style.top = '-22px';
        overlay.style.left = '-50px';
    } else {
        overlay.style.top = '-22px';
        overlay.style.left = '-22px';
    }

    trashcan.addEventListener('click', () => {
        document.body.removeChild(newSprite);
        TogetherJS.send({
            type: 'shape-remove',
            spriteId: newSprite.id
        });
    });

    const arrow = document.createElement('div');
    arrow.className = 'sprite-arrow';

    // Adjust the position of the arrow for triangles
    if (newSprite.classList.contains('triangle-container')) {
        arrow.style.left = '-12px';
        arrow.style.top = '27px';
        arrow.style.width = '23px';
        arrow.style.height = '23px';
    }

    newSprite.appendChild(arrow);
    newSprite.style.position = 'absolute';

    // Center sprite on screen
    newSprite.style.left = `${(window.innerWidth / 2) - 25}px`;
    newSprite.style.top = `${(window.innerHeight / 2) - 25}px`;

    newSprite.style.display = 'block';
    document.body.appendChild(newSprite);
    makeSpriteDraggable(newSprite);

    // Add name label if spriteName is provided
    if (spriteName) {
        const nameLabel = document.createElement('div');
        nameLabel.className = 'sprite-name';
        nameLabel.innerText = spriteName;
        newSprite.appendChild(nameLabel);
        spriteNameInput.value = ''; // Clear the input field
    }

    // Emit event via TogetherJS with unique ID
    TogetherJS.send({
        type: 'spawn-shape',
        shapeType: shapeType,
        color: color,
        spriteName: spriteName,
        spriteId: spriteId // Send unique ID
    });
}

// Function to make sprites draggable and rotatable
function makeSpriteDraggable(sprite) {
    let isDragging = false;
    let isRotating = false;
    let startX, startY, offsetX, offsetY;
    let rotationStartY, initialRotationAngle = 0;

    const trashcan = sprite.querySelector('.trashcan');
    const overlay = sprite.querySelector('.sprite-overlay');
    const arrow = sprite.querySelector('.sprite-arrow');
    const rotation = sprite.querySelector('.rotation');

    const handleMouseDown = (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = e.clientX - sprite.getBoundingClientRect().left;
        offsetY = e.clientY - sprite.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Show trashcan and rotation only when interacting with sprite
        trashcan.style.display = 'block';
        rotation.style.display = 'block';
    };

    function onMouseMove(e) {
        if (isRotating) {
            let deltaY = e.clientY - rotationStartY;
            let newRotationAngle = initialRotationAngle - deltaY * 1.2; // Adjust sensitivity here
            sprite.style.transform = `rotate(${newRotationAngle}deg)`;

            // Emit rotate event
            TogetherJS.send({
                type: 'rotate',
                spriteId: sprite.id,
                angle: newRotationAngle
            });
        } else if (isDragging) {
            // Calculate the new position
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Prevent dragging outside the window bounds
            const spriteRect = sprite.getBoundingClientRect();
            const minX = 0;
            const minY = 0;
            const maxX = window.innerWidth - spriteRect.width;
            const maxY = window.innerHeight - spriteRect.height;

            if (newX < minX) newX = minX;
            if (newY < minY) newY = minY;
            if (newX > maxX) newX = maxX;
            if (newY > maxY) newY = maxY;

            // Update the position of the sprite
            sprite.style.left = `${newX}px`;
            sprite.style.top = `${newY}px`;

            // Emit drag move event
            TogetherJS.send({
                type: 'drag-move',
                spriteId: sprite.id,
                newX,
                newY
            });
        }
    }

    function onMouseUp() {
        isDragging = false;
        isRotating = false;

        // Hide the trashcan and rotation after dragging or rotating
        if (!overlay.matches(':hover') && !arrow.matches(':hover') && !rotation.matches(':hover') && !trashcan.matches(':hover')) {
            trashcan.style.display = 'none';
            rotation.style.display = 'none';
        }

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Emit drag end event
        TogetherJS.send({
            type: 'drag-end',
            spriteId: sprite.id
        });
    }

    // Event listeners for rotation
    rotation.addEventListener('mousedown', (e) => {
        isRotating = true;
        rotationStartY = e.clientY;
        const currentRotation = sprite.style.transform.match(/rotate\((.*)deg\)/);
        initialRotationAngle = currentRotation ? parseFloat(currentRotation[1]) : 0;

        // Prevent dragging while rotating
        isDragging = false;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    sprite.addEventListener('mousedown', handleMouseDown);

    // Listen for TogetherJS drag and rotate events
    TogetherJS.hub.on('drag-start', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        startX = msg.offsetX;
        startY = msg.offsetY;
    });

    TogetherJS.hub.on('drag-move', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        sprite.style.left = `${msg.newX}px`;
        sprite.style.top = `${msg.newY}px`;
    });

    TogetherJS.hub.on('rotate', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        sprite.style.transform = `rotate(${msg.angle}deg)`;
    });

    TogetherJS.hub.on('drag-end', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        isDragging = false;
    });

    TogetherJS.hub.on('shape-remove', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        document.body.removeChild(sprite);
    });
}

// Reuse existing functions to create color circles and triangles
function createColorCircles() {
    const colorOptions = document.querySelectorAll('.color');
    colorOptions.forEach(colorOption => {
        const color = getComputedStyle(colorOption).backgroundColor;
        const circle = document.createElement('div');
        circle.className = 'color-circle';
        circle.style.backgroundColor = color;
        colorCirclesContainer.appendChild(circle);
    });
}

function createColorTriangles() {
    const colorOptions = document.querySelectorAll('.color');
    colorOptions.forEach(colorOption => {
        const color = getComputedStyle(colorOption).backgroundColor;
        const borderTriangle = document.createElement('div');
        borderTriangle.className = 'color-triangle-border';
        const colorTriangle = document.createElement('div');
        colorTriangle.className = 'color-triangle';
        colorTriangle.style.borderBottomColor = color;
        borderTriangle.appendChild(colorTriangle);
        colorTrianglesContainer.appendChild(borderTriangle);
    });
}
