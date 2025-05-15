import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");

  const fetchWeather = async () => {
    if (!city.trim()) return;

    try {
      setError("");
      const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;


      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
      );
      if (!weatherRes.ok) {
        const errData = await weatherRes.json();
        throw new Error(errData.message || "City not found");
      }
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
      );
      const forecastData = await forecastRes.json();
      setForecast(forecastData.list.slice(0, 8));

    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError(err.message);
    }
  };

const toggleUnit = () => {
  setUnit((prevUnit) => {
    const newUnit = prevUnit === "metric" ? "imperial" : "metric";
    setTimeout(() => {
      if (city.trim()) fetchWeather(); // refetch with new unit
    }, 0);
    return newUnit;
  });
};


  const getBackgroundClass = (condition) => {
    if (!condition) return "bg-default";
    const key = condition.toLowerCase();
    if (key.includes("clear")) return "bg-clear";
    if (key.includes("cloud")) return "bg-clouds";
    if (key.includes("rain") || key.includes("drizzle")) return "bg-rain";
    if (key.includes("snow")) return "bg-snow";
    if (key.includes("thunder")) return "bg-thunderstorm";
    if (key.includes("mist") || key.includes("fog")) return "bg-mist";
    return "bg-default";
  };

  return (
    <div className="app-background py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <h1 className="text-center text-white mb-4">Sam's Weather App</h1>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
              />
              <button className="btn btn-primary" onClick={fetchWeather}>
                Search
              </button>
            </div>

            <div className="text-center mb-3">
              <button className="btn btn-outline-light btn-sm" onClick={toggleUnit}>
                Switch to {unit === "metric" ? "Fahrenheit" : "Celsius"}
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {weather && (
              <div className={`card text-center shadow mb-4 ${getBackgroundClass(weather.weather[0].main)}`}>
                <div className="card-body">
                  <h3 className="card-title">{weather.name}</h3>
                  <img
                    src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                  />
                  <p className="card-text text-capitalize">
                    {weather.weather[0].description}
                  </p>
                  <h4>{weather.main.temp}°{unit === "metric" ? "C" : "F"}</h4>
                  <p>Humidity: {weather.main.humidity}%</p>
                  <p>Wind: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</p>
                </div>
              </div>
            )}

            {forecast.length > 0 && (
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title text-center">3-Hour Forecast (Next 24 Hours)</h5>
                  <div className="d-flex flex-row overflow-auto">
                    {forecast.map((f, i) => (
                      <div key={i} className="forecast-block text-center flex-shrink-0">
                        <div>{new Date(f.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <img
                          src={`http://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`}
                          alt={f.weather[0].description}
                        />
                        <div>{f.main.temp}°{unit === "metric" ? "C" : "F"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}