const sprite = document.getElementById('sprite');
const board = document.getElementById('board');

let offsetX, offsetY;

sprite.addEventListener('mousedown', (e) => {
    offsetX = e.clientX - sprite.getBoundingClientRect().left;
    offsetY = e.clientY - sprite.getBoundingClientRect().top;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    const boardRect = board.getBoundingClientRect();
    let newX = e.clientX - boardRect.left - offsetX;
    let newY = e.clientY - boardRect.top - offsetY;

    const minX = 27;
    const minY = 27;
    const maxX = board.offsetWidth - sprite.offsetWidth + 18;
    const maxY = board.offsetHeight - sprite.offsetHeight + 18;

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
}