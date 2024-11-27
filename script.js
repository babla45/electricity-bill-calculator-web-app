document.getElementById("calculateBtn").addEventListener("click", calculateBill);

// Toggle between input methods
const powerInputs = document.getElementById("powerInputs");
const voltCurrentInputs = document.getElementById("voltCurrentInputs");

document.getElementById("powerMethod").addEventListener("change", () => {
    powerInputs.classList.remove("hidden");
    voltCurrentInputs.classList.add("hidden");
});

document.getElementById("voltCurrentMethod").addEventListener("change", () => {
    voltCurrentInputs.classList.remove("hidden");
    powerInputs.classList.add("hidden");
});

function calculateBill() {
    const time = parseFloat(document.getElementById("time").value);
    const timeUnit = document.getElementById("timeUnit").value;
    const rate = parseFloat(document.getElementById("rate").value);

    if (isNaN(time) || isNaN(rate)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    let powerInKW;

    // Power-based calculation
    if (document.getElementById("powerMethod").checked) {
        const power = parseFloat(document.getElementById("power").value);
        const powerUnit = document.getElementById("powerUnit").value;

        if (isNaN(power)) {
            alert("Please enter a valid power value.");
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
            alert("Please enter valid voltage and current values.");
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
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <p><strong>Daily Energy Consumption:</strong> ${dailyEnergy.toFixed(2)} kWh</p>
        <p><strong>Hourly Cost:</strong> $${hourlyCost.toFixed(2)}</p>
        <p><strong>Cost Per Minute:</strong> $${minuteCost.toFixed(4)}</p>
        <p><strong>Daily Cost:</strong> $${dailyCost.toFixed(2)}</p>
        <p><strong>Monthly Cost:</strong> $${monthlyCost.toFixed(2)}</p>
        <p><strong>Yearly Cost:</strong> $${yearlyCost.toFixed(2)}</p>
    `;
}
