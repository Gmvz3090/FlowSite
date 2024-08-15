const sprites = document.querySelectorAll('.sprite');
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const colorOptions = document.querySelectorAll('.color');
const palette = document.getElementById('palette');

let selectedSprite = null;
let isDragging = false;

sprites.forEach(sprite => {
    let offsetX, offsetY;

    sprite.addEventListener('mousedown', (e) => {
        isDragging = false;  // Reset dragging flag on mousedown
        offsetX = e.clientX - sprite.getBoundingClientRect().left;
        offsetY = e.clientY - sprite.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        isDragging = true;  // Set dragging flag when mouse is moved
        selectedSprite = sprite;

        const boardRect = board.getBoundingClientRect();
        let newX = e.clientX - boardRect.left - offsetX;
        let newY = e.clientY - boardRect.top - offsetY;

        let minOffset = 0;
        let maxOffset = -8;

        if(selectedSprite.classList.contains('square')) {
            minOffset = 27;
            maxOffset = 18;
        }
        else {
            maxOffset = -10;
        }

        const minX = minOffset;
        const minY = minOffset;
        const maxX = board.offsetWidth - sprite.offsetWidth + maxOffset;
        const maxY = board.offsetHeight - sprite.offsetHeight + maxOffset;

        if (newX < minX) newX = minX;
        if (newY < minY) newY = minY;
        if (newX > maxX) newX = maxX;
        if (newY > maxY) newY = maxY;

        sprite.style.left = newX + 'px';
        sprite.style.top = newY + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (!isDragging) {  // Only open color picker if not dragging
            selectedSprite = sprite;

            // Show the color picker
            board.style.display = 'none';
            colorPicker.style.display = 'block';
        }

        isDragging = false;  // Reset dragging flag after mouse up
    }
});

colorOptions.forEach(colorOption => {
    colorOption.addEventListener('click', () => {
        const selectedColor = colorOption.getAttribute('data-color');

        // Change the selected sprite's color
        if (selectedSprite.classList.contains('triangle-container')) {
            selectedSprite.querySelector('.triangle').style.borderBottomColor = getComputedStyle(colorOption).backgroundColor;
        } else {
            selectedSprite.style.backgroundColor = getComputedStyle(colorOption).backgroundColor;
        }

        // Hide the color picker and show the board again
        colorPicker.style.display = 'none';
        board.style.display = 'block';
    });
});

function updatePaletteShapes(sprite) {
    colorOptions.forEach(color => {
        color.classList.add('square-color');
    });
}