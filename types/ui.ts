export type Theme = "dark" | "light";

export interface ChartColorScheme {
  fontColor: string;
  gridColor: string;
  backgroundColor: string;
  barFill: string;
  barSecondary: string;
  lineBorder: string;
  lineFill: string;
  pieColors: string[];
  timePieColors: string[];
}

export interface DisplayModeFlags {
  hasDarkClass: boolean;
  systemPrefersDark: boolean;
}

export interface UploaderOptions {
  onUploaded?: () => void;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";
