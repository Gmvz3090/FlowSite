const board = document.getElementById('board');
const colorCirclesContainer = document.getElementById('colorCircles');
const colorTrianglesContainer = document.getElementById('colorTriangles');
const palette = document.getElementById('palette');
const spriteNameInput = document.getElementById('sprite-name-input');

colorCirclesContainer.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('color-circle')) {
        const color = getComputedStyle(e.target).backgroundColor;
        spawnShapeAtCursor('circle', color, e);
    }
});

colorTrianglesContainer.addEventListener('mousedown', (e) => {
    let colorTriangle = e.target;
    if (!colorTriangle.classList.contains('color-triangle')) {
        colorTriangle = colorTriangle.closest('.color-triangle-border').querySelector('.color-triangle');
    }
    if (colorTriangle) {
        const color = getComputedStyle(colorTriangle).borderBottomColor;
        spawnShapeAtCursor('triangle', color);
    }
});

palette.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('color')) {
        const color = getComputedStyle(e.target).backgroundColor;
        spawnShapeAtCursor('square', color);
    }
});

function spawnShapeAtCursor(shapeType, color) {
    let newSprite;
    const spriteName = spriteNameInput.value.trim();

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
        document.body.removeChild(newSprite);  // Now remove from the whole document instead of the board
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
        spriteNameInput.value = '';
    }
}

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
        const rect = sprite.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        draggingSprite = sprite;

        // Show the trashcan and rotation while dragging
        trashcan.style.display = 'block';
        rotation.style.display = 'block';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    sprite.addEventListener('mousedown', handleMouseDown);

    function onMouseMove(e) {
        if (isRotating) {
            let deltaY = e.clientY - rotationStartY;
            let newRotationAngle = initialRotationAngle - deltaY * 1.2; // Adjust sensitivity here
            sprite.style.transform = `rotate(${newRotationAngle}deg)`;
        } else if (isDragging) {
            // Calculate the new position
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Prevent dragging outside the window bounds
            const spriteRect = draggingSprite.getBoundingClientRect();
            const minX = 0;
            const minY = 0;
            const maxX = window.innerWidth - spriteRect.width;
            const maxY = window.innerHeight - spriteRect.height;

            if (newX < minX) newX = minX;
            if (newY < minY) newY = minY;
            if (newX > maxX) newX = maxX;
            if (newY > maxY) newY = maxY;

            // Update the position of the sprite
            draggingSprite.style.left = `${newX}px`;
            draggingSprite.style.top = `${newY}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        isRotating = false;
        draggingSprite = null;

        // Hide the trashcan and rotation after dragging or rotating
        if (!overlay.matches(':hover') && !arrow.matches(':hover') && !rotation.matches(':hover') && !trashcan.matches(':hover')) {
            trashcan.style.display = 'none';
            rotation.style.display = 'none';
        }

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    arrow.addEventListener('mouseover', () => {
        trashcan.style.display = 'block';
        rotation.style.display = 'block';
    });

    arrow.addEventListener('mouseout', () => {
        if (!trashcan.matches(':hover') && !overlay.matches(':hover') && !rotation.matches(':hover')) {
            trashcan.style.display = 'none';
            rotation.style.display = 'none';
        }
    });

    overlay.addEventListener('mouseover', () => {
        trashcan.style.display = 'block';
        rotation.style.display = 'block';
    });

    overlay.addEventListener('mouseout', () => {
        if (!trashcan.matches(':hover') && !arrow.matches(':hover') && !rotation.matches(':hover')) {
            trashcan.style.display = 'none';
            rotation.style.display = 'none';
        }
    });

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

    rotation.addEventListener('mouseover', () => {
        trashcan.style.display = 'block';
        rotation.style.display = 'block';
    });

    rotation.addEventListener('mouseout', () => {
        if (!trashcan.matches(':hover') && !overlay.matches(':hover') && !arrow.matches(':hover') && !rotation.matches(':hover')) {
            trashcan.style.display = 'none';
            rotation.style.display = 'none';
        }
    });
}

createColorCircles();
createColorTriangles();

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
