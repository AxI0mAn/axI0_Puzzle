// История ходов
let moveHistory = []; // Массив для хранения истории состояний поля
let redoHistory = []; // Массив для хранения отменённых состояний поля
const MAX_HISTORY_SIZE = 5; // Максимальное количество сохраняемых ходов

// Элементы интерфейса
const undoButton = document.getElementById('undo-move');
const redoButton = document.getElementById('return-move');

// Обработчик кнопки "Отменить ход"
undoButton.addEventListener('click', () => {
  if (moveHistory.length > 0) {
    const lastState = moveHistory.pop(); // Извлекаем последнее состояние из истории
    redoHistory.push(getCurrentState()); // Сохраняем текущее состояние для возврата
    restoreState(lastState); // Восстанавливаем состояние поля
    updateMoveCount(-1); // Обновляем счётчик ходов
    // console.log("Отменён ход. Текущая пустая клетка:", emptyTile); // Отладочное сообщение
  }
});

// Обработчик кнопки "Вернуть ход"
redoButton.addEventListener('click', () => {
  if (redoHistory.length > 0) {
    const nextState = redoHistory.pop(); // Извлекаем состояние из истории возврата
    moveHistory.push(getCurrentState()); // Сохраняем текущее состояние в историю
    restoreState(nextState); // Восстанавливаем состояние поля
    updateMoveCount(1); // Обновляем счётчик ходов
    // console.log("Возвращён ход. Текущая пустая клетка:", emptyTile); // Отладочное сообщение
  }
});

// Функция для добавления текущего состояния в историю
function addMoveToHistory(state) {
  if (moveHistory.length >= MAX_HISTORY_SIZE) {
    moveHistory.shift(); // Удаляем самое старое состояние, если история превышает лимит
  }
  moveHistory.push(state); // Добавляем текущее состояние в историю
  redoHistory = []; // Очищаем историю возврата, так как новый ход делает её неактуальной
}