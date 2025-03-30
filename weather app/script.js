// Get weather data when page loads if there's a city in localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
        document.getElementById('city').value = savedCity;
        getWeather();
    }
});

// Allow Enter key to trigger search
document.getElementById('city').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});

function getWeather() {
    const apiKey = '4f8add8edf87a7007fbac3d2409cd86f';
    const city = document.getElementById('city').value.trim();

    if (!city) {
        showNotification('Please enter a city name');
        return;
    }

    // Add loading state
    document.getElementById('weather-container').style.opacity = '0.7';
    
    // Save city to localStorage
    localStorage.setItem('lastCity', city);

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    // Fetch current weather
    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            showNotification('City not found or network error. Please try again.');
        })
        .finally(() => {
            document.getElementById('weather-container').style.opacity = '1';
        });

    // Fetch forecast
    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            document.getElementById('hourly-forecast').innerHTML = '<p>Forecast data unavailable</p>';
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    const cityName = data.name;
    const country = data.sys.country;
    const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const feelsLike = Math.round(data.main.feels_like - 273.15);
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    const temperatureHTML = `
        <p>${temperature}°C</p>
    `;

    const weatherHtml = `
        <p>${cityName}, ${country}</p>
        <p>${description}</p>
        <div class="weather-details">
            <span><i class="fas fa-thermometer-half"></i> Feels like: ${feelsLike}°C</span> • 
            <span><i class="fas fa-tint"></i> Humidity: ${humidity}%</span> • 
            <span><i class="fas fa-wind"></i> Wind: ${wind} km/h</span>
        </div>
    `;

    tempDivInfo.innerHTML = temperatureHTML;
    weatherInfoDiv.innerHTML = weatherHtml;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;

    showImage();
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const formattedHour = hour < 10 ? `0${hour}` : hour;
        const temperature = Math.round(item.main.temp - 273.15); // Convert to Celsius
        const iconCode = item.weather[0].icon;
        const description = item.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${formattedHour}:00</span>
                <img src="${iconUrl}" alt="${description}">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}

function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500);
    }, 3000);
}

// Add notification style to the head
const style = document.createElement('style');
style.innerHTML = `
    .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 1000;
        display: none;
        opacity: 0;
        transition: opacity 0.5s ease;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(style);