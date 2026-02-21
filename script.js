const apiKey = "0576548be9ae427392d82505262102";
let chart;

function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) return alert("Enter city name");
    fetchWeather(city);
}

function fetchWeather(query) {
    const weatherDiv = document.getElementById("weatherResult");
    const forecastDiv = document.getElementById("forecast");
    const bg = document.getElementById("background");
    const rainSound = document.getElementById("rainSound");

    weatherDiv.innerHTML = "Loading...";
    forecastDiv.innerHTML = "";
    bg.innerHTML = "";
    rainSound.pause();

    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=7`)
        .then(res => res.json())
        .then(data => {

            if (data.error) {
                weatherDiv.innerHTML = "City not found!";
                return;
            }

            const current = data.current;
            const temp = current.temp_c;
            const condition = current.condition.text;

            weatherDiv.innerHTML = `
                <h2>${data.location.name}</h2>
                <img src="https:${current.condition.icon}" class="weather-icon">
                <p><strong>${temp}°C</strong></p>
                <p>${condition}</p>
            `;

            changeBackground(condition, temp);

            if (condition.includes("Rain")) rainSound.play();

            let labels = [];
            let temps = [];

            data.forecast.forecastday.forEach(day => {
                labels.push(day.date);
                temps.push(day.day.avgtemp_c);

                forecastDiv.innerHTML += `
                    <div class="forecast-day">
                        <p>${day.date}</p>
                        <img src="https:${day.day.condition.icon}" width="30">
                        <p>${day.day.avgtemp_c}°C</p>
                    </div>
                `;
            });

            createChart(labels, temps);
        });
}

function changeBackground(condition, temp) {
    const bg = document.getElementById("background");

    if (condition.includes("Sunny") || condition.includes("Clear")) {
        bg.style.background = "linear-gradient(to top, #fceabb, #f8b500)";
    }
    else if (condition.includes("Rain")) {
        bg.style.background = "linear-gradient(to top, #4e54c8, #8f94fb)";
        for (let i = 0; i < 70; i++) {
            const drop = document.createElement("div");
            drop.className = "drop";
            drop.style.left = Math.random() * 100 + "vw";
            bg.appendChild(drop);
        }
        const lightning = document.createElement("div");
        lightning.className = "lightning";
        bg.appendChild(lightning);
    }
    else if (condition.includes("Snow")) {
        bg.style.background = "linear-gradient(to top, #83a4d4, #b6fbff)";
        for (let i = 0; i < 50; i++) {
            const snow = document.createElement("div");
            snow.className = "snowflake";
            snow.innerHTML = "❄";
            snow.style.left = Math.random() * 100 + "vw";
            bg.appendChild(snow);
        }
    }
    else {
        bg.style.background = "linear-gradient(to top, #141e30, #243b55)";
    }

    const tempElement = document.querySelector("#weatherResult strong");
    if (temp > 30) tempElement.className = "hot";
    else if (temp < 15) tempElement.className = "cold";
    else tempElement.className = "normal";
}

function createChart(labels, temps) {
    const ctx = document.getElementById("tempChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Avg Temp (°C)",
                data: temps,
                borderColor: "white",
                fill: false
            }]
        }
    });
}

function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(pos => {
        fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

function saveCity() {
    const city = document.getElementById("cityInput").value;
    if (!city) return;
    localStorage.setItem("savedCity", city);
    alert("City Saved!");
}

window.onload = function() {
    const saved = localStorage.getItem("savedCity");
    if (saved) fetchWeather(saved);
}
