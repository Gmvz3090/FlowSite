const board = document.getElementById('board');
const colorCirclesContainer = document.getElementById('colorCircles');
const colorTrianglesContainer = document.getElementById('colorTriangles');
const colorSquaresContainer = document.getElementById('colorSquares');
const spriteNameInput = document.getElementById('sprite-name-input');
const plusButton = document.querySelector('.plus-button');
const paletteContainer = document.querySelector('.color-picker');

// Generate a unique ID for each sprite
function generateUniqueId() {
    return `sprite-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Event listeners for spawning shapes
const shapeContainers = [
    { container: colorCirclesContainer, shapeClass: 'ko_shape_bz', type: 'circle' },
    { container: colorTrianglesContainer, shapeClass: 't_shape_bz', type: 'triangle' },
    { container: colorSquaresContainer, shapeClass: 'kw_shape_bz', type: 'square' },
];

shapeContainers.forEach(({ container, shapeClass, type }) => {
    container.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const imageSrc = e.target.getAttribute('src');
            const uniqueId = generateUniqueId(); // Generate unique ID for each sprite
            console.log(`Spawning ${type} on board with image: ${imageSrc}`);
            spawnShapeOnBoard(type, imageSrc, uniqueId);
            // Emit event via TogetherJS to synchronize spawning across all users
            TogetherJS.send({
                type: 'spawn-shape',
                shapeType: type,
                imageSrc: imageSrc,
                spriteId: uniqueId
            });
        }
    });
});

// Listen for TogetherJS spawn-shape event
TogetherJS.hub.on('spawn-shape', function (msg) {
    if (!msg.sameUrl) return;

    // Check if the sprite already exists to avoid duplication
    if (!document.getElementById(msg.spriteId)) {
        spawnShapeOnBoard(msg.shapeType, msg.imageSrc, msg.spriteId);
    } else {
        console.warn(`Sprite with ID ${msg.spriteId} already exists.`);
    }
});
resizeBoard();
function resizeElements() {
    const boardSize = board.offsetWidth;
    const elementSize = boardSize / 25;

    document.querySelectorAll('.color-square img, .color-circle img, .color-triangle img').forEach(element => {
        element.style.width = `${elementSize}px`;
        element.style.height = `${elementSize}px`;
    });

    console.log("Resized elements based on board size.");
}

window.addEventListener('resize', resizeElements);
resizeElements();

function resizeBoard() {
    const size = window.innerHeight * 1.0;
    board.style.width = `${size}px`;
    board.style.height = `${size}px`;
    resizeSprites();
    console.log("Resized the board and sprites.");
	
}

window.addEventListener('resize', resizeBoard);
window.addEventListener('load', resizeBoard);
function togglePaletteVisibility() {
    if (paletteContainer.style.display === 'none' || paletteContainer.style.display === '') {
        paletteContainer.style.display = 'flex'; // Show the palette
        plusButton.querySelector('img').src = 'assets/x-button.svg'; // Change to x-button.svg
    } else {
        paletteContainer.style.display = 'none'; // Hide the palette
        plusButton.querySelector('img').src = 'assets/plus-button.svg'; // Change back to plus-button.svg
    }
}

// Add an event listener to the plus button to toggle the palette visibility
plusButton.addEventListener('click', togglePaletteVisibility);

// Initially hide the palette container
paletteContainer.style.display = 'none';

function spawnShapeOnBoard(shapeType, imageSrc, spriteId) {
    const spriteName = spriteNameInput.value.trim();
    const spriteSize = board.getBoundingClientRect().width / 15;
    const sprite = createShapeElement(shapeType, imageSrc, spriteSize, spriteId);

    if (spriteName) {
        addNameLabel(sprite, spriteName);
        spriteNameInput.value = '';
    }

    sprite.style.display = 'flex'; // Ensure the sprite is displayed as a flex element
    board.appendChild(sprite); // Append sprite to the board
    makeSpriteDraggable(sprite);
    resizeSprites();

    console.log(`Spawned a ${shapeType} on the board.`);
}

function createShapeElement(shapeType, imageSrc, size, spriteId) {
    const sprite = document.createElement('div');
    sprite.id = spriteId; // Set the unique sprite ID
    sprite.className = `sprite ${shapeType}`;
    sprite.style.width = `${size}px`;
    sprite.style.height = `${size}px`;
    sprite.style.position = 'absolute';
    sprite.style.display = 'flex'; // Ensure it displays
    sprite.style.backgroundColor = 'transparent'; // Ensure no background color

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.width = '100%';
    img.style.height = '100%';
    sprite.appendChild(img);

    const { left, width, top, height } = board.getBoundingClientRect();
    sprite.style.left = `${width / 2 - size / 2}px`; // Center within the board
    sprite.style.top = `${height / 2 - size / 2}px`; // Center within the board

    createSpriteControls(sprite, size);
    console.log(`Created a ${shapeType} element with image: ${imageSrc} at position (${sprite.style.left}, ${sprite.style.top}).`);

    return sprite;
}

function addNameLabel(sprite, name) {
    const nameLabel = document.createElement('div');
    nameLabel.className = 'sprite-name';
    nameLabel.innerText = name;
    sprite.appendChild(nameLabel);
    console.log(`Added name label: ${name}`);
}

function createSpriteControls(sprite, size) {
    const overlay = document.createElement('div');
    overlay.className = 'sprite-overlay';

    const trashcan = createControl('trashcan', size, () => {
        board.removeChild(sprite);
        console.log("Sprite removed from board.");

        // Emit event via TogetherJS to remove the sprite across all users
        TogetherJS.send({
            type: 'remove-shape',
            spriteId: sprite.id
        });
    });

    const rotation = createControl('rotation', size);

    sprite.appendChild(overlay);
    sprite.appendChild(trashcan);
    sprite.appendChild(rotation);
    console.log("Added controls to sprite.");
}

function createControl(className, size, onClick = null) {
    const control = document.createElement('div');
    control.className = className;
    control.style.width = `${size / 3}px`;
    control.style.height = `${size / 3}px`;
    control.style.bottom = `-${size / 6}px`;
    if (className === 'trashcan') control.style.right = `-${size / 6}px`;
    if (className === 'rotation') control.style.left = `-${size / 6}px`;

    if (onClick) control.addEventListener('click', onClick);
    console.log(`Created control: ${className}`);

    return control;
}

// Listen for TogetherJS remove-shape event
TogetherJS.hub.on('remove-shape', function (msg) {
    if (!msg.sameUrl) return;

    const sprite = document.getElementById(msg.spriteId);
    if (sprite) {
        board.removeChild(sprite);
    } else {
        console.warn(`Sprite with ID ${msg.spriteId} not found.`);
    }
});

function resizeSprites() {
    const boardRect = board.getBoundingClientRect();
    const spriteSize = boardRect.width / 12;

    document.querySelectorAll('.sprite').forEach(sprite => {
        sprite.style.width = `${spriteSize}px`;
        sprite.style.height = `${spriteSize}px`;

        ['trashcan', 'rotation'].forEach(controlClass => {
            const control = sprite.querySelector(`.${controlClass}`);
            const buttonSize = spriteSize / 2.5;
            control.style.width = `${buttonSize}px`;
            control.style.height = `${buttonSize}px`;
        });
    });

    console.log("Resized all sprites on the board.");
}

function makeSpriteDraggable(sprite) {
    let isDragging = false,
        isRotating = false,
        offsetX, offsetY, rotationStartY, initialRotationAngle = 0;

    const trashcan = sprite.querySelector('.trashcan');
    const rotation = sprite.querySelector('.rotation');

    sprite.addEventListener('mousedown', (e) => {
        if (e.target === trashcan || e.target === rotation) return;

        isDragging = true;
        const rect = sprite.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        sprite.style.zIndex = '10000';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        console.log("Started dragging sprite.");
    });

    function onMouseMove(e) {
        if (isRotating) {
            const deltaY = e.clientY - rotationStartY;
            const newRotationAngle = initialRotationAngle - deltaY * 1.2;
            sprite.style.transform = `rotate(${newRotationAngle}deg)`;
            TogetherJS.send({
                type: 'rotate-shape',
                spriteId: sprite.id,
                angle: newRotationAngle
            });
        } else if (isDragging) {
            const boardRect = board.getBoundingClientRect();
            const newX = e.clientX - boardRect.left - offsetX;
            const newY = e.clientY - boardRect.top - offsetY;
            sprite.style.left = `${newX}px`;
            sprite.style.top = `${newY}px`;

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
        sprite.style.zIndex = '100';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        console.log("Stopped dragging or rotating sprite.");
    }

    rotation.addEventListener('mousedown', (e) => {
        isRotating = true;
        rotationStartY = e.clientY;
        const currentRotation = sprite.style.transform.match(/rotate\((.*)deg\)/);
        initialRotationAngle = currentRotation ? parseFloat(currentRotation[1]) : 0;

        isDragging = false;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        console.log("Started rotating sprite.");
    });

    // Listen for TogetherJS drag and rotate events
    TogetherJS.hub.on('drag-move', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        sprite.style.left = `${msg.newX}px`;
        sprite.style.top = `${msg.newY}px`;
    });

    TogetherJS.hub.on('rotate-shape', function (msg) {
        if (!msg.sameUrl || msg.spriteId !== sprite.id) return;
        sprite.style.transform = `rotate(${msg.angle}deg)`;
    });
}
