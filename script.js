// Add debounce function at the top
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add dark mode toggle functionality at the top of the file
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const html = document.documentElement;
    
    // Check for saved user preference, default to light mode
    const darkMode = localStorage.getItem('darkMode') === 'enabled';
    
    // Set initial state
    if (darkMode) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    // Update toggle button icon based on mode
    const updateIcon = (isDark) => {
        darkModeToggle.innerHTML = isDark ? 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
    };
    
    // Set initial icon
    updateIcon(darkMode);
    
    darkModeToggle.addEventListener('click', () => {
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        updateIcon(isDark);
    });
}

// Call initDarkMode immediately
initDarkMode();

document.getElementById("calculateBtn").addEventListener("click", calculateBill);

// Toggle between input methods
const powerInputs = document.getElementById("powerInputs");
const voltCurrentInputs = document.getElementById("voltCurrentInputs");
const resultDiv = document.getElementById("result");

// Add event listeners for all input fields
const inputFields = document.querySelectorAll('input[type="number"], select');
const debouncedCalculate = debounce(calculateBill, 500);

inputFields.forEach(field => {
    field.addEventListener('input', debouncedCalculate);
});

function resetForm() {
    // Reset all input fields
    document.getElementById("power").value = "";
    document.getElementById("voltage").value = "";
    document.getElementById("current").value = "";
    document.getElementById("time").value = "";
    document.getElementById("rate").value = "";
    
    // Reset select elements to first option
    document.getElementById("powerUnit").selectedIndex = 0;
    document.getElementById("voltageUnit").selectedIndex = 0;
    document.getElementById("currentUnit").selectedIndex = 0;
    document.getElementById("timeUnit").selectedIndex = 0;
    
    // Clear results
    resultDiv.innerHTML = "";
}

document.getElementById("powerMethod").addEventListener("change", () => {
    powerInputs.classList.remove("hidden");
    voltCurrentInputs.classList.add("hidden");
    resetForm();
    calculateBill(); // Try to calculate immediately after switch
});

document.getElementById("voltCurrentMethod").addEventListener("change", () => {
    voltCurrentInputs.classList.remove("hidden");
    powerInputs.classList.add("hidden");
    resetForm();
    calculateBill(); // Try to calculate immediately after switch
});

// Modify the calculate function to handle empty fields
function calculateBill() {
    const time = parseFloat(document.getElementById("time").value);
    const timeUnit = document.getElementById("timeUnit").value;
    const rate = parseFloat(document.getElementById("rate").value);

    // Return early if required fields are empty, but don't show alert
    if (isNaN(time) || isNaN(rate)) {
        resultDiv.innerHTML = ""; // Clear results if inputs are invalid
        return;
    }

    let powerInKW;

    // Power-based calculation
    if (document.getElementById("powerMethod").checked) {
        const power = parseFloat(document.getElementById("power").value);
        const powerUnit = document.getElementById("powerUnit").value;

        if (isNaN(power)) {
            resultDiv.innerHTML = ""; // Clear results if power is invalid
            return;
        }

        switch (powerUnit) {
            case "Watt":
                powerInKW = power / 1000;
                break;
            case "kW":
                powerInKW = power;
                break;
            case "MW":
                powerInKW = power * 1000;
                break;
            case "mW":
                powerInKW = power / 1_000_000;
                break;
            case "HP":
                powerInKW = power * 0.746;
                break;
        }
    }
    // Voltage & Current-based calculation
    else if (document.getElementById("voltCurrentMethod").checked) {
        const voltage = parseFloat(document.getElementById("voltage").value);
        const current = parseFloat(document.getElementById("current").value);
        const voltageUnit = document.getElementById("voltageUnit").value;
        const currentUnit = document.getElementById("currentUnit").value;

        if (isNaN(voltage) || isNaN(current)) {
            resultDiv.innerHTML = ""; // Clear results if voltage/current is invalid
            return;
        }

        let voltageInV, currentInA;

        // Convert voltage to volts
        switch (voltageUnit) {
            case "V":
                voltageInV = voltage;
                break;
            case "kV":
                voltageInV = voltage * 1000;
                break;
            case "mV":
                voltageInV = voltage / 1000;
                break;
        }

        // Convert current to amperes
        switch (currentUnit) {
            case "A":
                currentInA = current;
                break;
            case "mA":
                currentInA = current / 1000;
                break;
        }

        powerInKW = (voltageInV * currentInA) / 1000;
    }

    // Convert time to hours per day
    const timeInHoursPerDay = timeUnit === "minutes" ? time / 60 : time;

    // Calculate energy consumption and costs
    const dailyEnergy = powerInKW * timeInHoursPerDay; // kWh per day
    const monthlyEnergy = dailyEnergy * 30; // kWh per month
    const yearlyEnergy = dailyEnergy * 365; // kWh per year

    const dailyCost = dailyEnergy * rate;
    const monthlyCost = monthlyEnergy * rate;
    const yearlyCost = yearlyEnergy * rate;
    const hourlyCost = dailyCost / (timeInHoursPerDay || 1); // Avoid divide-by-zero
    const minuteCost = hourlyCost / 60;

    // Display results
    resultDiv.innerHTML = `
        <div class="space-y-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-purple-200/50 dark:border-purple-400/20">
            <h3 class="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">Calculation Results</h3>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <span class="font-medium text-purple-700 dark:text-purple-300">Daily Energy:</span>
                <span class="text-pink-600 dark:text-pink-400 font-semibold">${dailyEnergy.toFixed(2)} kWh</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <span class="font-medium text-purple-700 dark:text-purple-300">Hourly Cost:</span>
                <span class="text-pink-600 dark:text-pink-400 font-semibold">$${hourlyCost.toFixed(2)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <span class="font-medium text-purple-700 dark:text-purple-300">Cost Per Minute:</span>
                <span class="text-pink-600 dark:text-pink-400 font-semibold">$${minuteCost.toFixed(4)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <span class="font-medium text-purple-700 dark:text-purple-300">Daily Cost:</span>
                <span class="text-pink-600 dark:text-pink-400 font-semibold">$${dailyCost.toFixed(2)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <span class="font-medium text-purple-700 dark:text-purple-300">Monthly Cost:</span>
                <span class="text-pink-600 dark:text-pink-400 font-semibold">$${monthlyCost.toFixed(2)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                <span class="font-medium text-purple-700 dark:text-purple-300">Yearly Cost:</span>
                <span class="text-pink-600 dark:text-pink-400 font-semibold">$${yearlyCost.toFixed(2)}</span>
            </p>
        </div>
    `;
}

// Remove the original click event listener since we're using input events now
document.getElementById("calculateBtn").removeEventListener("click", calculateBill);
// Add it back with the debounced version
document.getElementById("calculateBtn").addEventListener("click", debouncedCalculate);
