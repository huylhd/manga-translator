export interface ISocketMessage {
  canvasId: string;
  base64Str: string;
  textData: {
    text: string;
    vertices: any[];
    id: number;
    fontSize: number;
  }[];
  type: "image" | "text";
  isEdited?: boolean;
}
