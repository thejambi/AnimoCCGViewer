/* Keyboard shortcuts */

document.onkeyup = function (e) {
	// debug(e.which || e.keyCode);
	if (e.ctrlKey && (e.which || e.keyCode) == 77) {
		/* Ctrl + M */
		revealMoreCards();
	}
};