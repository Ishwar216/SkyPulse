// ====== script.js ======

const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key

const weatherResult = document.getElementById("weatherResult");
const forecastDiv = document.getElementById("forecast");
const cityInput = document.getElementById("cityInput");
const tempChartEl = document.getElementById("tempChart").getContext("2d");

let tempChart;

// ===== Fetch Weather by City =====
async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city!");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod !== 200) return alert(data.message);
    displayWeather(data);
    getForecast(city);
}

// ===== Fetch Weather by Geolocation =====
function getLocationWeather() {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
        getForecast(data.name);
    });
}

// ===== Display Weather =====
function displayWeather(data) {
    const { name, main, weather, wind } = data;
    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    weatherResult.innerHTML = `
        <h2>${name}</h2>
        <img src="${iconUrl}" alt="${weather[0].description}">
        <p>${weather[0].description.toUpperCase()}</p>
        <p>🌡 Temp: ${main.temp} °C</p>
        <p>💨 Wind: ${wind.speed} m/s</p>
        <p>💧 Humidity: ${main.humidity}%</p>
    `;
    updateBackground(weather[0].icon);
}

// ===== Fetch Forecast =====
async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    forecastDiv.innerHTML = "";
    const daily = {};

    data.list.forEach(item => {
        const day = item.dt_txt.split(" ")[0];
        if (!daily[day]) daily[day] = [];
        daily[day].push(item.main.temp);
    });

    const labels = [];
    const temps = [];

    Object.keys(daily).slice(0, 5).forEach(day => {
        const avg = daily[day].reduce((a,b)=>a+b,0)/daily[day].length;
        labels.push(day.split("-").slice(1).join("/"));
        temps.push(avg.toFixed(1));

        forecastDiv.innerHTML += `<div class="forecast-day">${day.split("-")[2]}th<br>${avg.toFixed(1)}°C</div>`;
    });

    // Chart.js
    if (tempChart) tempChart.destroy();
    tempChart = new Chart(tempChartEl, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Temp (°C)',
                data: temps,
                fill: true,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.8)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: { ticks: { color: 'white' } },
                x: { ticks: { color: 'white' } }
            }
        }
    });
}

// ===== Dark / Night Mode Toggle =====
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const btn = document.querySelector(".btn-group button:first-child");
    btn.textContent = document.body.classList.contains("dark") ? "☀ Day Mode" : "🌙 Dark Mode";
}

// ===== Save City =====
function saveCity() {
    const city = cityInput.value.trim();
    if (!city) return alert("Enter a city to save!");
    localStorage.setItem("savedCity", city);
    alert(`Saved ${city}!`);
}

// ===== Animated Background Effects =====
const background = document.getElementById("background");

// Sun/Moon Position
let angle = 0;
function animateSunMoon() {
    angle += 0.2;
    const x = 50 + 40 * Math.cos(angle*Math.PI/180);
    const y = 50 + 30 * Math.sin(angle*Math.PI/180);
    background.style.background = `radial-gradient(circle at ${x}% ${y}%, #FFD700, transparent 70%)`;
    requestAnimationFrame(animateSunMoon);
}
animateSunMoon();

// Stars for Night Mode
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.pointerEvents = "none";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const stars = Array.from({length: 100}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*1.2,
    opacity: Math.random()
}));

function drawStars() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (document.body.classList.contains("dark")) {
        stars.forEach(s => {
            s.opacity += (Math.random()-0.5)*0.05;
            if (s.opacity < 0) s.opacity=0;
            if (s.opacity > 1) s.opacity=1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
            ctx.fill();
        });
    }
    requestAnimationFrame(drawStars);
}
drawStars();

// ===== Window Resize =====
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
