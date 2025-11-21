// Элементы интерфейса
const customSelectStyle = document.querySelector('.custom-selectStyle');
const selectStyle = document.querySelector('.select-style');
const selectSkins = document.querySelector('.select-skins');
const skinOptions = selectSkins.querySelectorAll('div');


// Обработчик для кастомного выпадающего списка
selectStyle.addEventListener('click', () => {
  customSelectStyle.classList.toggle('active');
});



// Текущий выбранный стиль
let currentSkin = 'styles';

// Функция для изменения стиля
function changeSkin(skin) {
  // Удаляем текущий стиль, если он не default
  if (currentSkin !== 'styles') {
    const oldLink = document.querySelector(`link[href="styles${currentSkin}.css"]`);
    if (oldLink) {
      oldLink.remove();
    }
  }

  // Если выбран не default, добавляем новый стиль

  if (skin === 'light') {
    return;
  }
  if (skin !== 'styles') {
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = `styles${skin}.css`;
    document.head.appendChild(newLink);
  }


  // Обновляем текущий стиль
  currentSkin = skin;

}

// Обработчик для выбора стиля
skinOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const selectedSkin = option.getAttribute('data-style');
    selectStyle.textContent = selectedSkin;
    changeSkin(selectedSkin);
  });
});

// Обработчик для открытия/закрытия выпадающего списка
selectStyle.addEventListener('click', () => {
  selectSkins.style.display = selectSkins.style.display === 'block' ? 'none' : 'block';
});

selectSkins.addEventListener('click', () => {
  selectSkins.style.display = 'none';
});

// Закрываем выпадающий список при клике вне его
document.addEventListener('click', (event) => {
  if (!selectStyle.contains(event.target) && !selectSkins.contains(event.target)) {
    selectSkins.style.display = 'none';
  }
});