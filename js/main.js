import { API_KEY } from "./API.js";

(() => {
  // 1. Select the elements from the page
  const weatherSect = document.querySelector("#weather");
  const cityButtons = document.querySelectorAll("#city-container button");
  const themeToggle = document.querySelector("#theme-toggle");

  // 2. Reusable function that gets location data, then weather
  function getWeather(city) {
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

  // 3. Render HTML elements to the DOM through JavaScript
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

  // 4. Add click events to each city button
  cityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      getWeather(button.dataset.city);
    });
  });

  // 5. Initialize theme preference check on page load / refresh
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    if (themeToggle) {
      themeToggle.textContent = "Dark Theme";
    }
  }

  // 6. Handle theme toggle click actions
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");

      if (document.body.classList.contains("light-theme")) {
        themeToggle.textContent = "Dark Theme";
        localStorage.setItem("theme", "light");
      } else {
        themeToggle.textContent = "Light Theme";
        localStorage.setItem("theme", "dark");
      }
    });
  }

  // 7. Load one default city when the page first opens
  getWeather("Chicago");
})();
