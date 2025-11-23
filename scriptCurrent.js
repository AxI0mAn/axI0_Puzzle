let moveCountCurr = 0;
let timerInterval = null;
let startTime = null;

// Элементы интерфейса
const movesElement = document.getElementById('moves');
const timerElementCurr = document.getElementById('timer');
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
  moveCountCurr = 0;
  movesElement.textContent = `Step: ${moveCountCurr}`;
  stopTimer();
  timerElementCurr.textContent = 'Time: 00:00';
}

// Функция для запуска таймера
function startTimer() {
  if (!timerInterval) {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
  }
}

// Функция для обновления таймера
function updateTimer() {
  // Вычисляем общее прошедшее время в миллисекундах
  const currentTime = Date.now() - startTime;

  // --- 1. РАСЧЕТ ВРЕМЕНИ ---

  // Часы (более 1 часа)
  const hours = Math.floor(currentTime / 3600000);
  // Минуты (остаток после вычитания часов)
  const minutes = Math.floor((currentTime % 3600000) / 60000);
  // Секунды (остаток после вычитания минут)
  const seconds = Math.floor((currentTime % 60000) / 1000);

  // --- 2. ФОРМАТИРОВАНИЕ ---

  // Форматируем минуты, секунды и миллисекунды
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  let timeString;

  if (hours >= 1) {
    // Формат: ЧЧ:ММ:СС.МС (Часы показываются)
    const formattedHours = String(hours).padStart(2, '0');
    timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    // Формат: ММ:СС.МС (Часы не показываются)
    timeString = `${formattedMinutes}:${formattedSeconds}`;
  }

  // Обновляем элемент на странице
  timerElementCurr.textContent = `Time: ${timeString}`;
}


// Функция для остановки таймера
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Функция для обновления счётчика ходов
function updatemoveCountCurr(delta) {
  moveCountCurr = delta;
  movesElement.textContent = `Step: ${moveCountCurr}`;

  if (moveCountCurr === 1) {
    startTimer(); // Запускаем таймер при первом ходе
  }
}

