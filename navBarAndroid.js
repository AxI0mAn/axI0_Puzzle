function meta_link_cur() {
  let theme_link = document.getElementById('themeName');

  if (theme_link) {
    let meta_link = document.getElementById('theme-color-meta');
    let currentTheme = theme_link.className;
    let newColor;

    if (currentTheme === 'dark') {
      newColor = '#3d4c4bff';
    } else if (currentTheme === 'vanilla') {
      newColor = '#5d4640ff';
    } else if (currentTheme === 'ocean') {
      newColor = '#00024f';
    } else if (currentTheme === 'pinkly') {
      newColor = '#aa37d1';
    } else {
      newColor = '#71b8e1';
    }

    // Обновляем цвет темы в мета-теге
    if (meta_link) {
      meta_link.content = newColor;
    }
    console.log(currentTheme)
  }
}
