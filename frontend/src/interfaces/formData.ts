export interface IFormData {
  imageUrl: string;
  fontSize: number;
  type: "single" | "sequence";
  pattern?: string;
  target: "en" | "vi";
}
