let gridSize = 4; // По умолчанию 4x4
let tiles = []; // Массив, хранящий элементы в порядке их расположения на сетке (0..15)
let emptyTileIndex = gridSize * gridSize - 1; // Индекс пустой клетки в массиве tiles
let isAnimating = false; // Блокировка ввода во время анимации
let moveCount = 0; // Локальный счетчик ходов (чтобы код не ломался)

const puzzleContainer = document.getElementById('puzzle-container');
// Пытаемся найти элементы интерфейса, если они есть, чтобы не ломать старый код
const timerElement = document.getElementById('timer') || { textContent: '00:00' };

// --- Вспомогательные функции ---

function tileFontSize(grid, til) {
  if (grid === 4 || grid === 5) {
    til.style.fontSize = '2.5rem';
  } else if (grid === 6) {
    til.style.fontSize = '1.75rem';
  } else if (grid === 8) {
    til.style.fontSize = '1rem';
  }
}

// --- Работа с localStorage  ---

// === -📝=TODO=📝- === хранение последней использованной темы и размера поля
// === -📝=TODO=📝- === при выходе - сохранить не законченную игру, а при повторном входе - предложить продолжить

// --- Основная логика ---

function initializeGame() {
  puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  puzzleContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  // Очищаем и пересоздаем массив и DOM только если размер изменился или это первый запуск
  // Для надежности при рестарте создадим заново, но оптимизированно (через Fragment)
  puzzleContainer.innerHTML = '';
  tiles = [];

  const fragment = document.createDocumentFragment();
  const totalTiles = gridSize * gridSize;

  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');

    // Оптимизация CSS для GPU
    tile.style.willChange = 'transform, order';
    tile.style.transform = 'translateZ(0)';

    // Устанавливаем начальный order
    tile.style.order = i;

    if (i === totalTiles - 1) {
      // Пустая клетка
      tile.classList.add('empty');
      tile.dataset.value = '';
      emptyTileIndex = i;
    } else {
      // Обычная костяшка
      tileFontSize(gridSize, tile);
      tile.textContent = i + 1;
      tile.dataset.value = i + 1;
      tile.addEventListener('click', () => handleTileClick(tile));
    }

    fragment.appendChild(tile);
    tiles.push(tile);
  }

  puzzleContainer.appendChild(fragment);

  // Сбрасываем счетчики
  moveCount = 0;
  if (typeof updatemoveCountCurr === 'function') updatemoveCountCurr(0);

  // Перемешиваем
  shuffleTiles();
}

// Функция обработки клика (обертка над moveTile)
function handleTileClick(clickedTile) {
  if (isAnimating) return;

  // Находим актуальный индекс элемента в массиве (он соответствует позиции на сетке)
  const index = tiles.indexOf(clickedTile);
  moveTile(index);
}

function moveTile(index) {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const emptyRow = Math.floor(emptyTileIndex / gridSize);
  const emptyCol = emptyTileIndex % gridSize;

  // Проверяем соседство
  const isAdjacent =
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow);

  if (isAdjacent) {
    // Сохраняем ТЕКУЩЕЕ состояние ПЕРЕД тем, как оно изменится.
    // Это исправит игнорирование первого нажатия.
    addMoveToHistory(getCurrentState());

    // Теперь делаем ход
    swapTiles(index, emptyTileIndex);
  }
}

// Анимация и обмен
function swapTiles(tileIndex, emptyIndex) {
  isAnimating = true;

  const tileElement = tiles[tileIndex];
  const emptyElement = tiles[emptyIndex];

  // Вычисляем координаты
  const tileRow = Math.floor(tileIndex / gridSize);
  const tileCol = tileIndex % gridSize;
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;

  // Разница для анимации (сдвиг в %)
  const deltaX = (emptyCol - tileCol) * 100;
  const deltaY = (emptyRow - tileRow) * 100;

  // 1. Применяем анимацию через CSS Custom Properties
  tileElement.style.setProperty('--tx', `${deltaX}%`);
  tileElement.style.setProperty('--ty', `${deltaY}%`);
  tileElement.classList.add('animate-move');

  // 2. Ждем окончания анимации
  tileElement.addEventListener('animationend', () => {
    // Снимаем класс анимации
    tileElement.classList.remove('animate-move');
    tileElement.style.removeProperty('--tx');
    tileElement.style.removeProperty('--ty');

    // 3. Фактический обмен данными и DOM (order)
    performSwap(tileIndex, emptyIndex);

    // Разблокируем ввод
    isAnimating = false;

    // Логика игры (счетчик и победа)
    incrementMove();
    checkWin();
  }, { once: true });
}

// Мгновенный обмен без анимации (для перемешивания и завершения хода)
function performSwap(index1, index2) {
  // 1. Обмен в массиве tiles
  [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];

  // 2. Обмен CSS order
  tiles[index1].style.order = index1;
  tiles[index2].style.order = index2;

  // 3. Обновляем указатель на пустую клетку
  // Если один из индексов был пустым, обновляем глобальную переменную
  if (tiles[index1].classList.contains('empty')) emptyTileIndex = index1;
  if (tiles[index2].classList.contains('empty')) emptyTileIndex = index2;
}

// Перемешивание (без анимации и перерисовок)
function shuffleTiles() {
  // Делаем 1000 валидных ходов в памяти
  for (let i = 0; i < 1000; i++) {
    const neighbors = getNeighbors(emptyTileIndex);
    const randomNeighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    performSwap(randomNeighborIndex, emptyTileIndex);
  }
}

function getNeighbors(index) {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const neighbors = [];

  if (row > 0) neighbors.push(index - gridSize); // Верх
  if (row < gridSize - 1) neighbors.push(index + gridSize); // Низ
  if (col > 0) neighbors.push(index - 1); // Лево
  if (col < gridSize - 1) neighbors.push(index + 1); // Право

  return neighbors;
}

// Проверка победы
function checkWin() {
  // Проверяем, упорядочен ли массив data-value
  const isWin = tiles.every((tile, index) => {
    // Последняя клетка должна быть пустой
    if (index === gridSize * gridSize - 1) return tile.classList.contains('empty');
    // Остальные должны совпадать с индексом + 1
    return tile.dataset.value == (index + 1);
  });

  if (isWin) {
    // Вызываем внешние функции если они есть, иначе алерт
    if (typeof stopTimer === 'function') resetGame(); //TODO stopTimer();
    if (typeof updateRecords === 'function') {
      updateRecords(gridSize, moveCount, timerElement.textContent);
    } else {
      // alert(`Победа! Ходов: ${moveCount}`);
      console.log("Победа!");
    }
  }
}

// Безопасное обновление счетчика
function incrementMove() {
  moveCount++;
  if (typeof updatemoveCountCurr === 'function') {
    updatemoveCountCurr(moveCount);
  } else {
    // Пытаемся найти элемент на странице, если функции нет
    const countEl = document.getElementById('move-count');
    if (countEl) countEl.textContent = moveCount;
  }
}

// Получение состояния для сохранения (совместимость)
function getCurrentState() {
  return tiles.map(tile => tile.dataset.value || '');
}

// Восстановление состояния (совместимость)
function restoreState(savedStateValues) {
  // Защита от пустых данных
  if (!savedStateValues || savedStateValues.length === 0) return;

  // 1. Приводим savedStateValues к плоскому массиву (если он был 2D)
  const flatValues = savedStateValues.flat ? savedStateValues.flat() : savedStateValues;

  // 2. Создаем карту для быстрого поиска DOM-элементов: "значение" -> HTMLElement
  const valueMap = {};
  tiles.forEach(tile => {
    // Используем String(), чтобы "1" и 1 считались одним и тем же
    valueMap[String(tile.dataset.value)] = tile;
  });

  // 3. Собираем новый массив tiles в том порядке, который пришел из истории
  const newTiles = [];

  flatValues.forEach((val, index) => {
    // Находим элемент. val может быть числом, приводим к строке
    const tile = valueMap[String(val)];

    if (tile) {
      newTiles.push(tile);

      // Визуально переставляем элемент (CSS order)
      tile.style.order = index;

      // Удаляем возможные классы анимации, чтобы элемент не "застрял" в движении
      tile.classList.remove('animate-move');
      tile.style.removeProperty('--tx');
      tile.style.removeProperty('--ty');

      // Обновляем глобальный индекс пустой клетки, если это она
      if (tile.classList.contains('empty')) {
        emptyTileIndex = index;
      }
    } else {
      console.error("Не найден элемент для значения:", val);
    }
  });

  // 4. Заменяем глобальный массив tiles на восстановленный
  tiles = newTiles;

}
// Теперь запускаем игру с уже правильными gridSize и темой
initializeGame();

