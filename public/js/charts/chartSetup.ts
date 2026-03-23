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

Chart.defaults.animation = false;

export { Chart };
