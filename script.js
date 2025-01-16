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
        <div class="space-y-3 bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-purple-200/50">
            <h3 class="text-xl font-semibold text-purple-800 mb-4">Calculation Results</h3>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 rounded-lg transition-colors">
                <span class="font-medium text-purple-700">Daily Energy:</span>
                <span class="text-pink-600 font-semibold">${dailyEnergy.toFixed(2)} kWh</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 rounded-lg transition-colors">
                <span class="font-medium text-purple-700">Hourly Cost:</span>
                <span class="text-pink-600 font-semibold">$${hourlyCost.toFixed(2)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 rounded-lg transition-colors">
                <span class="font-medium text-purple-700">Cost Per Minute:</span>
                <span class="text-pink-600 font-semibold">$${minuteCost.toFixed(4)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 rounded-lg transition-colors">
                <span class="font-medium text-purple-700">Daily Cost:</span>
                <span class="text-pink-600 font-semibold">$${dailyCost.toFixed(2)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 rounded-lg transition-colors">
                <span class="font-medium text-purple-700">Monthly Cost:</span>
                <span class="text-pink-600 font-semibold">$${monthlyCost.toFixed(2)}</span>
            </p>
            <p class="flex justify-between items-center p-2 hover:bg-purple-50/50 rounded-lg transition-colors">
                <span class="font-medium text-purple-700">Yearly Cost:</span>
                <span class="text-pink-600 font-semibold">$${yearlyCost.toFixed(2)}</span>
            </p>
        </div>
    `;
}

// Remove the original click event listener since we're using input events now
document.getElementById("calculateBtn").removeEventListener("click", calculateBill);
// Add it back with the debounced version
document.getElementById("calculateBtn").addEventListener("click", debouncedCalculate);
