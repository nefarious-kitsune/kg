/* eslint-env browser */

/**
 * Reset input
 * @param {number} n - Hero index
 */
function reset(n) {
  const heroAvatar = document.getElementById('Hero-Avatar' + n);
  heroAvatar.setAttribute('class', 'hero-avatar ssr');

  document.getElementById('Hero' + n).selectedIndex = -1;
  document.getElementById('Current-Level' + n).selectedIndex = -1;
  document.getElementById('Target-Level' + n).selectedIndex = -1;
  document.getElementById('Available-Card' + n).value = 0;
  document.getElementById('result' + n).innerText = 'N/A';
}

/**
 * Reset input
 * @param {number} n - Hero index
 */
function calc(n) {
  const heroAvatar = document.getElementById('Hero-Avatar' + n);
  const heroSelector = document.getElementById('Hero' + n);
  if (heroSelector.selectedIndex !== -1) {
    const heroId = heroSelector.options[heroSelector.selectedIndex].value;
    heroAvatar.setAttribute('class', 'hero-avatar ssr ' + heroId);
  } else {
    heroAvatar.setAttribute('class', 'hero-avatar ssr');
  };

  const currentLevelSelector = document.getElementById('Current-Level' + n);
  const targetLevelSelector = document.getElementById('Target-Level' + n);
  const availableCardInput = document.getElementById('Available-Card' + n);
  const resultOutput = document.getElementById('result' + n);

  if (
    (currentLevelSelector.selectedIndex === -1) ||
    (targetLevelSelector.selectedIndex === -1)
  ) {
    resultOutput.innerText = 'N/A';
    return;
  }

  let cardCount = parseInt(availableCardInput.value);

  if (Number.isNaN(cardCount)) cardCount = 0;
  else if (cardCount >= 1) cardCount--;

  const IndexToCardCount = [
    20, 40, 0,
    70, 110, 160, 0,
    220, 290, 370, 450, 0,
    550, 660, 780, 990, 1050, 0,
    1220, 1401, 1590, 1790, 2000,
  ];;

  const cardsNeeded =
    IndexToCardCount[targetLevelSelector.selectedIndex] -
    IndexToCardCount[currentLevelSelector.selectedIndex] -
    cardCount;

  console.log('cardsNeeded', cardsNeeded);

  if (cardsNeeded <= 0) {
    resultOutput.innerText = '0';
    return;
  };

  resultOutput.innerText = Math.ceil(cardsNeeded / 1.4);
}
