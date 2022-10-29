export interface ITextData {
  text: string;
  vertices: { x: number; y: number }[];
  id: number;
  fontSize: number;
}

export interface ISocketMessage {
  canvasId: string;
  base64Str: string;
  textData: ITextData[];
  type: "image" | "text";
  isEdited?: boolean;
}
