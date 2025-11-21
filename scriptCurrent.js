let moveCount = 0;
let timerInterval = null;
let startTime = null;

// Элементы интерфейса
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const newGameButton = document.getElementById('new-game');


// Обработчик кнопки "New Game"
newGameButton.addEventListener('click', () => {
  initializeGame();
  resetGame();
  moveHistory = []; // Сбрасываем историю ходов
  redoHistory = []; // Сбрасываем историю возврата
});

// Кастомный выпадающий список
const customSelect = document.querySelector('.custom-select');
const selectSelected = document.querySelector('.select-selected');
const selectItems = document.querySelector('.select-items');


// Обработчик для кастомного выпадающего списка размера поля
selectSelected.addEventListener('click', () => {
  customSelect.classList.toggle('active');
});

selectItems.querySelectorAll('div').forEach((item) => {
  item.addEventListener('click', () => {
    const selectedValue = item.getAttribute('data-size');
    gridSize = parseInt(selectedValue);
    selectSelected.textContent = item.textContent;
    customSelect.classList.remove('active');
    emptyTile = { row: gridSize - 1, col: gridSize - 1 };
    initializeGame();
    resetGame();
    moveHistory = []; // Сбрасываем историю ходов
    redoHistory = []; // Сбрасываем историю возврата
  });
});

// Закрываем выпадающий список при клике вне его
document.addEventListener('click', (event) => {
  if (!selectSelected.contains(event.target) && !selectItems.contains(event.target)) {
    customSelect.classList.remove('active');
  }
});

// Функция для сброса игры
function resetGame() {
  moveCount = 0;
  movesElement.textContent = `Step: ${moveCount}`;
  stopTimer();
  timerElement.textContent = 'Time: 00:00:00';
}

// Функция для запуска таймера
function startTimer() {
  if (!timerInterval) {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// Функция для остановки таймера
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Функция для обновления таймера
function updateTimer() {
  const currentTime = Date.now() - startTime;
  const hours = Math.floor(currentTime / 3600000);
  const minutes = Math.floor((currentTime % 3600000) / 60000);
  const seconds = Math.floor((currentTime % 60000) / 1000);

  timerElement.textContent = `Time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Функция для обновления счётчика ходов
function updateMoveCount(delta) {
  moveCount += delta;
  movesElement.textContent = `Step: ${moveCount}`;

  if (moveCount === 1) {
    startTimer(); // Запускаем таймер при первом ходе
  }
}