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
        spawnShapeAtCursor('triangle', color, e);
    }
});

palette.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('color')) {
        const color = getComputedStyle(e.target).backgroundColor;
        spawnShapeAtCursor('square', color, e);
    }
});

function spawnShapeAtCursor(shapeType, color, event) {
    let newSprite;
    const spriteName = spriteNameInput.value.trim();
    const boardRect = board.getBoundingClientRect();
    const boardWidth = boardRect.width;
    const boardHeight = boardRect.height;

    if (shapeType === 'circle') {
        newSprite = document.createElement('div');
        newSprite.className = 'sprite circle';
        newSprite.style.backgroundColor = color;
        newSprite.style.border = '2px solid #333';
        newSprite.style.borderRadius = '50%';
        newSprite.style.width = '50px';
        newSprite.style.height = '50px';
        newSprite.style.position = 'absolute';
        newSprite.style.left = `${boardWidth - 100}px`;
        newSprite.style.top = '50px';
    } else if (shapeType === 'triangle') {
        newSprite = document.createElement('div');
        newSprite.className = 'sprite triangle-container';
        newSprite.style.position = 'absolute';
        const innerTriangle = document.createElement('div');
        innerTriangle.className = 'triangle';
        innerTriangle.style.borderBottomColor = color;
        innerTriangle.style.width = '0';
        innerTriangle.style.height = '0';
        innerTriangle.style.borderLeft = '25px solid transparent';
        innerTriangle.style.borderRight = '25px solid transparent';
        innerTriangle.style.borderBottom = `50px solid ${color}`;
        innerTriangle.style.display = 'block';
        newSprite.appendChild(innerTriangle);
        newSprite.style.left = '40px';
        newSprite.style.top = '100px';
    } else if (shapeType === 'square') {
        newSprite = document.createElement('div');
        newSprite.className = 'sprite square';
        newSprite.style.backgroundColor = color;
        newSprite.style.border = '2px solid #333';
        newSprite.style.borderRadius = '5px';
        newSprite.style.width = '50px';
        newSprite.style.height = '50px';
        newSprite.style.position = 'absolute';
        newSprite.style.left = `${(boardWidth / 2) - 25}px`;
        newSprite.style.top = `${(boardHeight / 2) + 50}px`;
    }

    newSprite.style.display = 'block';
    board.appendChild(newSprite);
    makeSpriteDraggable(newSprite);

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
    let startX, startY, offsetX, offsetY;

    sprite.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = e.clientX - sprite.getBoundingClientRect().left;
        offsetY = e.clientY - sprite.getBoundingClientRect().top;
        draggingSprite = sprite;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging || !draggingSprite) return;
        const boardRect = board.getBoundingClientRect();
        let XcenterAdjustment = -5;
        let YcenterAdjustment = -5;

        if (draggingSprite.classList.contains('square')) {
            XcenterAdjustment = 22;
            YcenterAdjustment = 22;
        }

        let newX = e.clientX - boardRect.left - offsetX + XcenterAdjustment;
        let newY = e.clientY - boardRect.top - offsetY + YcenterAdjustment;

        const spriteRect = draggingSprite.getBoundingClientRect();
        let minOffset = 0;
        let maxOffset = -10;

        if (draggingSprite.classList.contains('square')) {
            minOffset = 27;
            maxOffset = 18;
        }

        const minX = minOffset;
        const minY = minOffset;
        const maxX = board.offsetWidth - draggingSprite.offsetWidth + maxOffset;
        const maxY = board.offsetHeight - draggingSprite.offsetHeight + maxOffset;

        if (newX < minX) newX = minX;
        if (newY < minY) newY = minY;
        if (newX > maxX) newX = maxX;
        if (newY > maxY) newY = maxY;

        draggingSprite.style.left = newX + 'px';
        draggingSprite.style.top = newY + 'px';
    }

    function onMouseUp() {
        isDragging = false;
        draggingSprite = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
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
