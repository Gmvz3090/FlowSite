const sprites = document.querySelectorAll('.sprite');
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const colorOptions = document.querySelectorAll('.color');
const nameInput = document.getElementById('sprite-name-input');
const acceptButton = document.getElementById('acceptButton');
const declineButton = document.getElementById('declineButton');

let selectedSprite = null;
let previousColorElement = null;

sprites.forEach(sprite => {
    let offsetX, offsetY;

    sprite.addEventListener('mousedown', (e) => {
        isDragging = false;
        offsetX = e.clientX - sprite.getBoundingClientRect().left;
        offsetY = e.clientY - sprite.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        isDragging = true;
        selectedSprite = sprite;

        const boardRect = board.getBoundingClientRect();
        let newX = e.clientX - boardRect.left - offsetX;
        let newY = e.clientY - boardRect.top - offsetY;

        let minOffset = 0;
        let maxOffset = -8;

        if (selectedSprite.classList.contains('square')) {
            minOffset = 27;
            maxOffset = 18;
        } else {
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

        if (!isDragging) {
            selectedSprite = sprite;

            // Update the name input field with the current sprite name
            nameInput.value = selectedSprite.querySelector('.sprite-name').innerText;

            // Show the color picker and name input
            board.style.display = 'none';
            colorPicker.style.display = 'block';
        }

        isDragging = false;
    }
});

colorOptions.forEach(colorOption => {
    colorOption.addEventListener('click', () => {
        // Remove the outer border from the previously selected color
        if (previousColorElement) {
            previousColorElement.classList.remove('selected');
        }

        // Update the current color option
        previousColorElement = colorOption;
        colorOption.classList.add('selected');
    });
});

acceptButton.addEventListener('click', () => {
    if (selectedSprite) {
        if (previousColorElement) {
            const color = getComputedStyle(previousColorElement).backgroundColor;

            if (selectedSprite.classList.contains('triangle-container')) {
                selectedSprite.querySelector('.triangle').style.borderBottomColor = color;
            } else {
                selectedSprite.style.backgroundColor = color;
            }
        }

        selectedSprite.querySelector('.sprite-name').innerText = nameInput.value;
    }

    // Hide the color picker and show the board again
    colorPicker.style.display = 'none';
    board.style.display = 'block';
});

declineButton.addEventListener('click', () => {
    // Hide the color picker and show the board again
    colorPicker.style.display = 'none';
    board.style.display = 'block';
});
