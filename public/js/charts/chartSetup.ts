// Регистрация Chart.js компонентов
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  PieController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

// Регистрируем все необходимые компоненты
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  PieController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Title,
  Tooltip,
  Filler
);

export { Chart };
