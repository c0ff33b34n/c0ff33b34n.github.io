class PomodoroTimer {
    constructor() {
        this.timeDisplay = document.getElementById('time');
        this.modeDisplay = document.getElementById('mode');
        this.startBtn = document.getElementById('start');
        this.pauseBtn = document.getElementById('pause');
        this.resetBtn = document.getElementById('reset');
        this.progressFill = document.getElementById('progressFill');
        this.currentSessionDisplay = document.getElementById('currentSession');
        this.totalSessionsDisplay = document.getElementById('totalSessions');
        this.completedSessionsDisplay = document.getElementById('completedSessions');
        this.totalTimeDisplay = document.getElementById('totalTime');

        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.longBreakTimeInput = document.getElementById('longBreakTime');
        this.sessionsBeforeLongBreakInput = document.getElementById('sessionsBeforeLongBreak');

        this.timeLeft = 25 * 60;
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.isWorkTime = true;
        this.currentSession = 1;
        this.completedSessions = 0;
        this.timer = null;

        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Update settings when changed
        [this.workTimeInput, this.breakTimeInput, this.longBreakTimeInput, this.sessionsBeforeLongBreakInput]
            .forEach(input => input.addEventListener('change', () => this.updateSettings()));
    }

    updateSettings() {
        if (!this.isRunning) {
            this.workTime = parseInt(this.workTimeInput.value) * 60;
            this.breakTime = parseInt(this.breakTimeInput.value) * 60;
            this.longBreakTime = parseInt(this.longBreakTimeInput.value) * 60;
            this.sessionsBeforeLongBreak = parseInt(this.sessionsBeforeLongBreakInput.value);
            this.totalSessionsDisplay.textContent = this.sessionsBeforeLongBreak;
            this.reset();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timer = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            clearInterval(this.timer);
        }
    }

    reset() {
        this.pause();
        this.isWorkTime = true;
        this.currentSession = 1;
        this.timeLeft = this.workTime;
        this.totalTime = this.workTime;
        this.updateDisplay();
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
        } else {
            this.switchMode();
        }
    }

    switchMode() {
        if (this.isWorkTime) {
            this.completedSessions++;
            this.completedSessionsDisplay.textContent = this.completedSessions;
            this.totalTimeDisplay.textContent = Math.floor(this.completedSessions * this.workTime / 60);
            
            if (this.currentSession % this.sessionsBeforeLongBreak === 0) {
                this.timeLeft = this.longBreakTime;
                this.totalTime = this.longBreakTime;
                this.modeDisplay.textContent = 'Long Break Time';
            } else {
                this.timeLeft = this.breakTime;
                this.totalTime = this.breakTime;
                this.modeDisplay.textContent = 'Break Time';
            }
        } else {
            this.currentSession++;
            this.currentSessionDisplay.textContent = this.currentSession;
            this.timeLeft = this.workTime;
            this.totalTime = this.workTime;
            this.modeDisplay.textContent = 'Work Time';
        }
        
        this.isWorkTime = !this.isWorkTime;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const pomodoro = new PomodoroTimer();
}); 