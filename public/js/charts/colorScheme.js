export function getChartColorScheme() {
  const isDarkMode =
    window.matchMedia("(prefers-color-scheme: dark)").matches ||
    document.body.classList.contains("dark-theme");

  return {
    fontColor: isDarkMode ? "#e1e1e1" : "#333",
    gridColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
  };
}
