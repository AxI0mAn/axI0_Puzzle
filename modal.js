// Элементы модального окна
const modal = document.getElementById('modal');
const modalMoves = document.getElementById('modal-moves');
const modalTime = document.getElementById('modal-time');
const modalClose = document.getElementById('modal-close');

// Функция для отображения модального окна
function showModal(moves, time) {
  modalMoves.textContent = moves; // Устанавливаем количество ходов
  modalTime.textContent = time; // Устанавливаем время
  modal.style.display = 'flex'; // Показываем модальное окно
}

// Функция для скрытия модального окна
function hideModal() {
  modal.style.display = 'none'; // Скрываем модальное окно
}

// Обработчик для кнопки закрытия
modalClose.addEventListener('click', hideModal);

// Обработчик для закрытия модального окна по клику вне его
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    hideModal();
  }
});

// Обновлённая функция checkWin
function checkWin() {
  const isWin = tiles.every((tile, index) => {
    if (index === gridSize * gridSize - 1) return true; // Последняя клетка пустая
    return tile.textContent == index + 1;
  });

  if (isWin) {
    stopTimer();
    updateRecords(gridSize, moveCount, timerElement.textContent); // Обновляем рекорды
    showModal(moveCount, timerElement.textContent); // Показываем модальное окно
  }
}