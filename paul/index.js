// 🚀 Matrix Calculator Logic
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('input[type="button"]');
const form = document.querySelector('form');
const resetBtn = document.querySelector('input[type="reset"]');
const equalsBtn = document.querySelector('.equals');

// Sound effects (using Web Audio API)
function playSound(frequency, duration) {
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();
	
	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);
	
	oscillator.frequency.value = frequency;
	oscillator.type = 'sine';
	
	gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
	
	oscillator.start();
	oscillator.stop(audioContext.currentTime + duration);
}

// Matrix-style typing effect
function matrixType(element, text) {
	const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
	let iterations = 0;
	
	const interval = setInterval(() => {
		element.value = text.split('').map((char, index) => {
			if (index < iterations) {
				return char;
			}
			return chars[Math.floor(Math.random() * chars.length)];
		}).join('');
		
		if (iterations >= text.length) {
			clearInterval(interval);
			element.value = text;
		}
		
		iterations += 1/3;
	}, 30);
}

// Prevent form submit
form.addEventListener('submit', function(e) {
	e.preventDefault();
});

// Button click handler with enhanced effects
buttons.forEach(btn => {
	if (btn.value === '=') return; // handled separately
	btn.addEventListener('click', function() {
		playSound(800, 0.1); // Button click sound
		display.value += btn.value;
		// Add subtle shake animation
		display.style.animation = 'none';
		setTimeout(() => {
			display.style.animation = 'displayPulse 0.3s ease';
		}, 10);
	});
});

// Clear button with dramatic effect
resetBtn.addEventListener('click', function() {
	playSound(400, 0.3); // Clear sound
	display.style.animation = 'clearEffect 0.5s ease';
	setTimeout(() => {
		display.value = '';
		display.style.animation = '';
	}, 200);
});

// Equals button with matrix effect
equalsBtn.addEventListener('click', function() {
	try {
		const result = eval(display.value);
		playSound(1000, 0.2); // Success sound
		matrixType(display, result.toString());
	} catch {
		playSound(200, 0.5); // Error sound
		matrixType(display, 'ERROR');
		setTimeout(() => {
			display.value = '';
		}, 1500);
	}
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
	@keyframes displayPulse {
		0% { transform: scale(1); }
		50% { transform: scale(1.02); }
		100% { transform: scale(1); }
	}
	
	@keyframes clearEffect {
		0% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.98); }
		100% { opacity: 1; transform: scale(1); }
	}
`;
document.head.appendChild(style);
