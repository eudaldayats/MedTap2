document.addEventListener('DOMContentLoaded', () => {
    const paracetamolBtn = document.getElementById('paracetamolBtn');
    const ibuprofenBtn = document.getElementById('ibuprofenBtn');
    const paracetamolTimer = document.getElementById('paracetamolTimer');
    const ibuprofenTimer = document.getElementById('ibuprofenTimer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Key for localStorage
    const STORAGE_KEY = 'medicationTrackerLog';

    // State to hold all logs
    let log = loadLog();

    // --- Time Calculation and Formatting ---

    /**
     * Converts a timestamp to a formatted hh:mm string, or >12h if elapsed time exceeds 12 hours.
     * @param {number} timestamp - The last recorded time in milliseconds.
     * @returns {string} The formatted time string.
     */
    function formatTimeElapsed(timestamp) {
        if (!timestamp) {
            return '—';
        }

        const now = Date.now();
        const elapsedMilliseconds = now - timestamp;
        const twelveHoursInMs = 12 * 60 * 60 * 1000;

        if (elapsedMilliseconds > twelveHoursInMs) {
            return '>12h';
        }

        const totalMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Use String.padStart to ensure two digits
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');

        return `${hh}:${mm}`;
    }

    // --- Local Storage Functions ---

    /** Loads log from localStorage or returns an empty array. */
    function loadLog() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Could not load log from localStorage", e);
            return [];
        }
    }

    /** Saves the current log array to localStorage. */
    function saveLog() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
        } catch (e) {
            console.error("Could not save log to localStorage", e);
        }
    }

    // --- UI and Data Management ---

    /** Renders the full history list based on the log array. */
    function renderHistory() {
        historyList.innerHTML = ''; // Clear existing list
        
        // Log is already sorted most recent on top after a new entry is added
        log.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${entry.medication}</span>
                <span class="dose-time">${new Date(entry.time).toLocaleString()}</span>
            `;
            historyList.appendChild(li);
        });
    }

    /** Updates the two elapsed time counters. */
    function updateTimers() {
        const lastParacetamol = log.find(entry => entry.medication === 'Paracetamol');
        const lastIbuprofen = log.find(entry => entry.medication === 'Ibuprofen');

        paracetamolTimer.textContent = formatTimeElapsed(lastParacetamol ? lastParacetamol.time : null);
        ibuprofenTimer.textContent = formatTimeElapsed(lastIbuprofen ? lastIbuprofen.time : null);
    }

    /** * Handles the button click: records the dose, updates the log, saves, and refreshes the UI.
     * @param {string} medication - 'Paracetamol' or 'Ibuprofen'.
     */
    function recordDose(medication) {
        const newEntry = {
            medication: medication,
            time: Date.now()
        };

        // Add new entry and keep log sorted (most recent first)
        log.unshift(newEntry);
        
        saveLog();
        renderHistory();
        updateTimers();

        // Optional: brief visual feedback on the button
        const btn = medication === 'Paracetamol' ? paracetamolBtn : ibuprofenBtn;
        btn.classList.add('taken-feedback');
        setTimeout(() => {
            btn.classList.remove('taken-feedback');
        }, 500);
    }

    /** Clears all data from the log and localStorage. */
    function clearHistory() {
        if (confirm("Are you sure you want to clear ALL medication history? This cannot be undone.")) {
            log = [];
            localStorage.removeItem(STORAGE_KEY);
            renderHistory();
            updateTimers(); // Reset timers to '-'
        }
    }

    // --- Initialization and Event Listeners ---

    // 1. Initial Render
    renderHistory();
    updateTimers();

    // 2. Set up interval to update timers every minute (60,000ms)
    setInterval(updateTimers, 60000); 

    // 3. Button Event Listeners
    paracetamolBtn.addEventListener('click', () => recordDose('Paracetamol'));
    ibuprofenBtn.addEventListener('click', () => recordDose('Ibuprofen'));
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Optional CSS for feedback (can be added to style.css or here)
    const style = document.createElement('style');
    style.textContent = `
        .taken-feedback { 
            animation: flashGreen 0.5s; 
        }
        @keyframes flashGreen {
            0% { background-color: initial; }
            50% { background-color: #2ecc71; } /* A brief flash of success color */
            100% { background-color: initial; }
        }
        #paracetamolBtn.taken-feedback { background-color: #2ecc71 !important; }
        #ibuprofenBtn.taken-feedback { background-color: #2ecc71 !important; }
    `;
    document.head.appendChild(style);

});