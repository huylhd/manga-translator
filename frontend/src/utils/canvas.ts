import { ISocketMessage } from "../interfaces/socketMessage";

export const handleDrawImage = (data: ISocketMessage) =>
  new Promise<void>((resolve) => {
    const { canvasId, base64Str, textData } = data;
    if (textData) return resolve();

    const canvas: any = document.getElementById(canvasId);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    const imageObj = new Image();
    imageObj.src = `data:image/png;base64,${base64Str}`;

    imageObj.onload = function () {
      ctx.canvas.width = imageObj.width;
      ctx.canvas.height = imageObj.height;
      ctx.drawImage(
        imageObj,
        0,
        0,
        Math.min(imageObj.width, document.body.clientWidth),
        imageObj.height
      );
      resolve();
    };
  });

export const handleDrawText = async (data: ISocketMessage) => {
  const { canvasId, textData } = data;
  if (!textData) return;
  const canvas: any = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  for (const block of textData) {
    fillRect({ ctx, ...block });
    fillText({ ctx, ...block });
  }
};

export const fillRect = ({ ctx, vertices }: any) => {
  if (!Array.isArray(vertices)) {
    return;
  }
  const [topLeft, topRight, bottomRight] = vertices;
  const x = topLeft.x;
  const y = topLeft.y;
  const width = topRight.x - topLeft.x + 10;
  const height = bottomRight.y - topRight.y + 10;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = "white";
  ctx.fill();
};

export const fillText = ({ ctx, text, vertices, fontSize = 18 }: any) => {
  if (!Array.isArray(vertices)) {
    return;
  }
  ctx.font = `${fontSize}px Georgia`;
  ctx.fillStyle = "#000000";
  const [topLeft, topRight] = vertices;
  const x = topLeft.x + 10;
  const y = topRight.y + 10;
  const maxWidth = topRight.x - topLeft.x;
  wrapText({ ctx, text, x, y, maxWidth, lineHeight: fontSize * 1 });
};

const wrapText = ({ ctx, text, x, y, maxWidth, lineHeight }: any) => {
  var cars = text.split("\n");

  for (var ii = 0; ii < cars.length; ii++) {
    var line = "";
    var words = cars[ii].split(" ");

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;

      if (testWidth > maxWidth) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y);
    y += lineHeight;
  }
};
