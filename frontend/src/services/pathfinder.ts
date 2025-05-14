export async function getPath(from: string, to: string) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/pathfinder`, {
    method: "POST",
    body: JSON.stringify({ from, to }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await res.json();
}

export async function getPathNoWeather(from: string, to: string) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/pathfinder/noweather`,
    {
      method: "POST",
      body: JSON.stringify({ from, to }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return await res.json();
}
