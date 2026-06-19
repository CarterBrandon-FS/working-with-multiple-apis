import { API_KEY } from "./API.js";

(() => {
  // Select the elements from the page
  const weatherSect = document.querySelector("#weather");
  const cityButtons = document.querySelectorAll("#city-container button");

  // Reusable function that gets location data, then weather
  function getWeather(city) {
    weatherSect.innerHTML = "";
    weatherSect.textContent = "Loading weather...";

    // Check localStorage before making another API request
    const savedWeather = localStorage.getItem(city);

    if (savedWeather) {
      displayWeather(JSON.parse(savedWeather));
      return;
    }

    // First API: get lat and long from OpenCage
    fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${API_KEY}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Location request failed");
        }

        return response.json();
      })
      .then((locationData) => {
        const lat = locationData.results[0].geometry.lat;
        const lng = locationData.results[0].geometry.lng;

        // Second API: use the coord to get weather from Open-Meteo
        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&temperature_unit=fahrenheit`,
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        return response.json();
      })
      .then((weatherData) => {
        const cityWeather = {
          city: city,
          temperature: weatherData.current_weather.temperature,
          windspeed: weatherData.current_weather.windspeed,
        };

        // Save the results so the same city does not request again
        localStorage.setItem(city, JSON.stringify(cityWeather));
        displayWeather(cityWeather);
      })
      .catch((error) => {
        weatherSect.innerHTML = "";
        weatherSect.textContent = "Could not load weather data";
        console.log(error);
      });
  }

  function displayWeather(cityWeather) {
    weatherSect.innerHTML = "";

    const cityName = document.createElement("h2");
    cityName.textContent = cityWeather.city;

    const temperature = document.createElement("p");
    temperature.classList.add("temp");
    temperature.textContent = `Temperature ${cityWeather.temperature}°F`;

    const windspeed = document.createElement("p");
    windspeed.textContent = `Wind Speed: ${cityWeather.windspeed} mph`;

    weatherSect.appendChild(cityName);
    weatherSect.appendChild(temperature);
    weatherSect.appendChild(windspeed);
  }

  // Add click events to each city button
  cityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      getWeather(button.dataset.city);
    });
  });

  // Load one city when the page first opens
  getWeather("Chicago");
})();
