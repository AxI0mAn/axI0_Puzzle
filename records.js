// Элементы интерфейса
const recordsButton = document.getElementById('records');
const closeButton = document.createElement('button');
closeButton.id = 'close';
closeButton.textContent = '❌';

// Локальное хранилище для рекордов
const RECORDS_KEY = 'puzzleRecords';
const MAX_RECORDS = 10;

// Флаг состояния: открыты ли рекорды сейчас
let isRecordsOpen = false;

// Инициализация рекордов
function initializeRecords() {
  if (!localStorage.getItem(RECORDS_KEY)) {
    const initialRecords = {
      '4x4': [],
      '5x5': [],
      '6x6': [],
      '8x8': [],
    };
    localStorage.setItem(RECORDS_KEY, JSON.stringify(initialRecords));
  }
}

// Получение рекордов для текущего размера поля
function getRecords(gridSize) {
  const records = JSON.parse(localStorage.getItem(RECORDS_KEY));
  return records[`${gridSize}x${gridSize}`];
}

// Обновление рекордов
function updateRecords(gridSize, moves, time) {
  const records = JSON.parse(localStorage.getItem(RECORDS_KEY));
  const currentRecords = records[`${gridSize}x${gridSize}`];

  const newRecord = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    moves,
    timeSpent: time,
  };

  currentRecords.push(newRecord);

  currentRecords.sort((a, b) => {
    if (a.moves === b.moves) {
      return a.timeSpent.localeCompare(b.timeSpent);
    }
    return a.moves - b.moves;
  });

  if (currentRecords.length > MAX_RECORDS) {
    currentRecords.splice(MAX_RECORDS);
  }

  records[`${gridSize}x${gridSize}`] = currentRecords;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

// Отображение рекордов
function showRecords(gridSize) {
  if (isRecordsOpen) return; // Защита от двойного открытия

  // 1. Добавляем состояние в историю браузера (для кнопки "Назад" на телефоне)
  history.pushState({ modal: 'records' }, '', '#records');
  isRecordsOpen = true;

  const records = getRecords(gridSize);
  puzzleContainer.innerHTML = '';

  const recordsBox = document.createElement('div');
  recordsBox.classList.add('recordsBox');

  const header = document.createElement('div');
  header.classList.add('recordsBox__header');

  const title = document.createElement('h2');
  title.classList.add('recordBox__title');
  title.textContent = `Best result for ${gridSize}x${gridSize}`;
  header.appendChild(title);
  header.appendChild(closeButton);
  recordsBox.appendChild(header);

  const recordsList = document.createElement('ul');
  recordsList.classList.add('recordsList');
  records.forEach((record, index) => {
    const recordItem = document.createElement('li');
    recordItem.classList.add('recordItem');
    recordItem.textContent = `${index + 1}: ${record.moves} steps, ${record.timeSpent} (${record.date} ${record.time})`;
    recordsList.appendChild(recordItem);
  });

  recordsBox.appendChild(recordsList);
  puzzleContainer.appendChild(recordsBox);
}

// Функция фактического закрытия окна (восстановления игры)
function closeRecordsUI() {
  isRecordsOpen = false;

  // Важно: renderTiles() просто отрисует поле заново без сброса игры.
  // Если renderTiles недоступен глобально, используйте initializeGame(), 
  // но initializeGame сбросит прогресс текущей партии.
  if (typeof renderTiles === 'function') {
    puzzleContainer.innerHTML = ''; // Очистить рекорды
    // Восстанавливаем DOM костяшек (если они были сохранены в переменной tiles)
    tiles.forEach(tile => puzzleContainer.appendChild(tile));
  } else {
    initializeGame();
  }
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---

// 1. Обработка системной кнопки "Назад" (Mobile Back Button)
window.addEventListener('popstate', (event) => {
  // Если мы были в режиме рекордов и нажали "Назад"
  if (isRecordsOpen) {
    closeRecordsUI();
  }
});

// 2. Обработчик кнопки "Рекорды" (работает как переключатель)
recordsButton.addEventListener('click', () => {
  if (isRecordsOpen) {
    // Если открыто -> вызываем history.back(), чтобы закрыть через popstate
    history.back();
  } else {
    // Если закрыто -> открываем
    showRecords(gridSize);
  }
});

// 3. Обработчик кнопки "Закрыть" (крестик)
closeButton.addEventListener('click', () => {
  // Вызываем history.back(), чтобы убрать запись из истории и закрыть окно
  history.back();
});


// Инициализация рекордов при загрузке
initializeRecords();

// Обновление рекордов после выигрыша (без изменений)
function checkWin() {
  const isWin = tiles.every((tile, index) => {
    if (index === gridSize * gridSize - 1) return true;
    return tile.dataset.value == index + 1;
  });

  if (isWin) {
    if (typeof stopTimer === 'function') stopTimer();
    updateRecords(gridSize, moveCount, timerElement.textContent);
    console.log(`records.js You've won for ${moveCount} steps and ${timerElement.textContent}!`);
  }
}