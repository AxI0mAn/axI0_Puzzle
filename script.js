let gridSize = 4; // По умолчанию 4x4
let tiles = [];
let emptyTile = { row: gridSize - 1, col: gridSize - 1 }; // Пустая клетка в начальной позиции
const puzzleContainer = document.getElementById('puzzle-container');

// размер шрифта костяшек
function tileFontSize(grid, til) {
  if (grid === 4 || grid === 5) {
    til.style.fontSize = '2.5rem';
  } else if (grid === 6) {
    til.style.fontSize = '1.75rem';
  } else if (grid === 8) {
    til.style.fontSize = '1rem';
  }

}

// Инициализация игры
function initializeGame() {

  tiles = [];
  puzzleContainer.innerHTML = '';
  puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  puzzleContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  const totalTiles = gridSize * gridSize - 1;

  // Создаем костяшки
  for (let i = 1; i <= totalTiles; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tileFontSize(gridSize, tile);
    tile.textContent = i;
    tile.addEventListener('click', () => moveTile(i));
    tiles.push(tile);
  }

  // Добавляем пустую костяшку
  const empty = document.createElement('div');
  empty.classList.add('tile', 'empty');
  tiles.push(empty);

  // Сбрасываем позицию пустой клетки
  emptyTile = { row: gridSize - 1, col: gridSize - 1 };

  // Перемешиваем костяшки
  shuffleTiles();

  // Отображаем костяшки
  renderTiles();
}

// Функция для перемешивания костяшек
function shuffleTiles() {
  for (let i = 0; i < 1000; i++) {
    const movableTiles = getMovableTiles();
    const randomTile = movableTiles[Math.floor(Math.random() * movableTiles.length)];
    swapTiles(randomTile, emptyTile);
  }
}

// Функция для получения костяшек, которые можно переместить
function getMovableTiles() {
  const movableTiles = [];
  const directions = [
    { row: emptyTile.row - 1, col: emptyTile.col }, // Верхняя костяшка
    { row: emptyTile.row + 1, col: emptyTile.col }, // Нижняя костяшка
    { row: emptyTile.row, col: emptyTile.col - 1 }, // Левая костяшка
    { row: emptyTile.row, col: emptyTile.col + 1 }, // Правая костяшка
  ];

  directions.forEach((dir) => {
    if (dir.row >= 0 && dir.row < gridSize && dir.col >= 0 && dir.col < gridSize) {
      movableTiles.push({ row: dir.row, col: dir.col });
    }
  });

  return movableTiles;
}

// Функция для перемещения костяшки
function moveTile(number) {
  const tileIndex = tiles.findIndex((tile) => tile.textContent == number);
  const tileRow = Math.floor(tileIndex / gridSize);
  const tileCol = tileIndex % gridSize;

  // Проверяем, находится ли костяшка рядом с пустой клеткой
  if (isAdjacentToEmpty(tileRow, tileCol)) {
    const move = {
      tile: { row: tileRow, col: tileCol }, // Координаты костяшки
      empty: { ...emptyTile }, // Координаты пустой клетки
    };
    addMoveToHistory(getCurrentState()); // Сохраняем текущее состояние
    swapTiles(move.tile, move.empty); // Меняем местами костяшку и пустую клетку
    emptyTile = move.tile; // Обновляем позицию пустой клетки
    renderTiles(); // Перерисовываем поле
    updateMoveCount(1); // Обновляем счётчик ходов
    checkWin(); // Проверяем, выиграл ли игрок
  }
}

// Функция для проверки, находится ли костяшка рядом с пустой клеткой
function isAdjacentToEmpty(row, col) {
  return (
    (Math.abs(row - emptyTile.row) === 1 && col === emptyTile.col) || // Сверху или снизу
    (Math.abs(col - emptyTile.col) === 1 && row === emptyTile.row) // Слева или справа
  );
}

// Функция для обмена местами костяшки и пустой клетки без анимации

// function swapTiles(tile1, tile2) {
//   const index1 = tile1.row * gridSize + tile1.col;
//   const index2 = tile2.row * gridSize + tile2.col;
//   [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];
//   emptyTile = tile1; // Обновляем позицию пустой клетки
// }

// Функция для анимации обмена местами костяшки и пустой клетки
let isAnimating = false; // Флаг для блокировки анимации

function swapTiles(tile1, tile2) {
  if (isAnimating) return; // Если анимация выполняется, выходим из функции

  const index1 = tile1.row * gridSize + tile1.col;
  const index2 = tile2.row * gridSize + tile2.col;

  // Получаем DOM-элементы костяшек
  const tileElement1 = tiles[index1];
  const tileElement2 = tiles[index2];

  // Вычисляем разницу в позициях для анимации
  const fromX = (tile2.col - tile1.col) * -100 + '%';
  const fromY = (tile2.row - tile1.row) * -100 + '%';

  // Применяем анимацию к костяшке
  tileElement1.style.setProperty('--from-x', fromX);
  tileElement1.style.setProperty('--from-y', fromY);
  tileElement1.classList.add('animate');

  // Меняем местами костяшки в массиве
  [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];

  // Обновляем позицию пустой клетки
  emptyTile = tile1;

  // Убираем анимацию после завершения
  tileElement1.addEventListener('animationend', () => {
    tileElement1.classList.remove('animate');
    isAnimating = false;
  }, { once: true });

  // Перерисовываем поле
  renderTiles();
}

// Функция для отрисовки костяшек
function renderTiles() {
  puzzleContainer.innerHTML = '';
  tiles.forEach((tile, index) => {
    tile.style.order = index; // Используем CSS order для позиционирования
    puzzleContainer.appendChild(tile);
  });
}

// Функция для проверки победы
function checkWin() {
  const isWin = tiles.every((tile, index) => {
    if (index === gridSize * gridSize - 1) return true; // Последняя клетка пустая
    return tile.textContent == index + 1;
  });

  if (isWin) {
    stopTimer();
    // alert(`script.js Поздравляем! Вы выиграли за ${moveCount} ходов и ${timerElement.textContent}!`);
    updateRecords(gridSize, moveCount, timerElement.textContent); // Обновляем рекорды
  }
}
// Функция для получения текущего состояния поля
function getCurrentState() {
  const state = [];
  for (let row = 0; row < gridSize; row++) {
    const rowState = [];
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      rowState.push(tiles[index].textContent || ''); // Сохраняем текст костяшки или пустую строку
    }
    state.push(rowState);
  }
  return state;
}

// Функция для восстановления состояния поля
function restoreState(state) {
  tiles = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const value = state[row][col];
      const tile = document.createElement('div');
      if (value === '') {
        tile.classList.add('tile', 'empty');
        emptyTile = { row, col }; // Обновляем позицию пустой клетки
      } else {
        tile.classList.add('tile');
        tile.textContent = value;
        tile.addEventListener('click', () => moveTile(value));
      }
      tileFontSize(gridSize, tile);
      tiles.push(tile);
    }
  }
  renderTiles();
}

// Инициализация игры при загрузке
initializeGame();

