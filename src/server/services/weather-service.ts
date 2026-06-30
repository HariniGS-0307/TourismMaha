type WeatherForecastItem = {
  dt_txt?: string;
  weather?: Array<{ description?: string }>;
  main?: { temp?: number };
  rain?: { "3h"?: number };
};

type OpenWeatherResponse = {
  list?: WeatherForecastItem[];
};

export async function getWeatherForCoordinates(
  latitude: number,
  longitude: number,
) {
  if (!process.env.OPENWEATHER_API_KEY) {
    return {
      source: "mock",
      current: {
        summary: "Pleasant conditions",
        temperature: 24,
      },
      forecast: [
        {
          date: new Date().toISOString(),
          summary: "Light clouds",
          temp: 24,
          rain: 0,
        },
        {
          date: new Date(Date.now() + 86400000).toISOString(),
          summary: "Light rain",
          temp: 23,
          rain: 1.2,
        },
        {
          date: new Date(Date.now() + 172800000).toISOString(),
          summary: "Cloudy",
          temp: 22,
          rain: 0.5,
        },
      ],
      warning: null,
    };
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`,
    {
      next: { revalidate: 1800 },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch weather.");
  }

  const data = (await response.json()) as OpenWeatherResponse;
  const forecast = (data.list ?? []).slice(0, 3).map((item) => ({
    date: item.dt_txt ?? new Date().toISOString(),
    summary: item.weather?.[0]?.description ?? "Unknown",
    temp: item.main?.temp ?? 0,
    rain: item.rain?.["3h"] ?? 0,
  }));

  const heavyRain = forecast.some((item) => item.rain > 8);

  return {
    source: "openweather",
    current: {
      summary: forecast[0]?.summary ?? "Unknown",
      temperature: forecast[0]?.temp ?? 0,
    },
    forecast,
    warning: heavyRain
      ? "Heavy rain forecast. Trekking and outdoor activities may be unsafe."
      : null,
  };
}
