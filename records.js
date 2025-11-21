// Элементы интерфейса
const recordsButton = document.getElementById('records');
const closeButton = document.createElement('button');
closeButton.id = 'close';
closeButton.textContent = '❌';

// Локальное хранилище для рекордов
const RECORDS_KEY = 'puzzleRecords';
const MAX_RECORDS = 10;

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

  // Создаем новый объект с результатами
  const newRecord = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    moves,
    timeSpent: time,
  };

  // Добавляем новый результат в массив
  currentRecords.push(newRecord);

  // Сортируем массив по количеству ходов и времени
  currentRecords.sort((a, b) => {
    if (a.moves === b.moves) {
      return a.timeSpent.localeCompare(b.timeSpent);
    }
    return a.moves - b.moves;
  });

  // Оставляем только 10 лучших результатов
  if (currentRecords.length > MAX_RECORDS) {
    currentRecords.splice(MAX_RECORDS);
  }

  // Обновляем локальное хранилище
  records[`${gridSize}x${gridSize}`] = currentRecords;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

// Отображение рекордов
function showRecords(gridSize) {
  const records = getRecords(gridSize);
  puzzleContainer.innerHTML = '';

  // Создаём контейнер для рекордов
  const recordsBox = document.createElement('div');
  recordsBox.classList.add('recordsBox');

  // Coздаём header = title + closeButton
  const header = document.createElement('div');
  header.classList.add('recordsBox__header')

  // Создаем и добавляем заголовок
  const title = document.createElement('h2');
  title.classList.add('recordBox__title')
  title.textContent = `Best result for ${gridSize}x${gridSize}`;
  header.appendChild(title);

  // Добавляем кнопку закрытия
  header.appendChild(closeButton);

  // Добавляем header
  recordsBox.appendChild(header);

  // Создаем и добавляем список рекордов
  const recordsList = document.createElement('ul');
  recordsList.classList.add('recordsList');
  records.forEach((record, index) => {
    const recordItem = document.createElement('li');
    recordItem.classList.add('recordItem');
    recordItem.textContent = `${index + 1}: ${record.moves} steps, ${record.timeSpent} (${record.date} ${record.time})`;
    recordsList.appendChild(recordItem);
  });

  recordsBox.appendChild(recordsList);

  // Добавляем информацию о рекордах 
  puzzleContainer.appendChild(recordsBox);
}

// Обработчик кнопки "Рекорды"
recordsButton.addEventListener('click', () => {
  showRecords(gridSize);
});

// Обработчик кнопки "Закрыть"
closeButton.addEventListener('click', () => {
  initializeGame();
});

// Инициализация рекордов при загрузке
initializeRecords();

// Обновление рекордов после выигрыша
function checkWin() {
  const isWin = tiles.every((tile, index) => {
    if (index === gridSize * gridSize - 1) return true; // Последняя клетка пустая
    return tile.textContent == index + 1;
  });

  if (isWin) {
    stopTimer();
    updateRecords(gridSize, moveCount, timerElement.textContent);
    console.log(`records.js You've won for ${moveCount} steps and ${timerElement.textContent}!`);
  }
}