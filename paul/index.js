// Calculator logic
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('input[type="button"]');
const form = document.querySelector('form');
const resetBtn = document.querySelector('input[type="reset"]');
const equalsBtn = document.querySelector('.equals');

// Prevent form submit
form.addEventListener('submit', function(e) {
	e.preventDefault();
});

// Button click handler
buttons.forEach(btn => {
	if (btn.value === '=') return; // handled separately
	btn.addEventListener('click', function() {
		display.value += btn.value;
	});
});

// Clear button
resetBtn.addEventListener('click', function() {
	display.value = '';
});

// Equals button
equalsBtn.addEventListener('click', function() {
	try {
		display.value = eval(display.value);
	} catch {
		display.value = 'Fehler';
	}
});
