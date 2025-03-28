/* eslint-env browser */

/**
 * Show dropdown list
 * @param {*} listId - element id of the dropdown list
 */
function showDropdownList(listId) {
  const dropdowns = document.getElementsByClassName('dropdown-content');
  for (let i = 0; i < dropdowns.length; i++) {
    const openDropdown = dropdowns[i];
    if (openDropdown.id !== listId) {
      openDropdown.classList.remove('show');
    }
  }
  document.getElementById(listId).classList.toggle('show');
}

document.addEventListener('click', (event)=>{
  if (!event.target.matches('.dropdown-button')) {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
});
