/* eslint-env browser */

const dropdowns = document.getElementsByClassName('dropdown-content');

/**
 * Hide dropdown list
 * @param {*} excluded - Id of drop list to exclude
 */
function hideDropdownList(excluded = '') {
  for (let i = 0; i < dropdowns.length; i++) {
    const openDropdown = dropdowns[i];
    if (openDropdown.id !== excluded) {
      openDropdown.classList.remove('show');
    }
  }
}

/**
 * Show dropdown list
 * @param {*} listId - element id of the dropdown list
 */
function showDropdownList(listId) {
  hideDropdownList(listId);
  document.getElementById(listId).classList.toggle('show');
}

document.addEventListener('click', (event)=>{
  if (!event.target.matches('.dropdown-button')) hideDropdownList('');
});
