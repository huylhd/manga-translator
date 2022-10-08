import * as Jimp from "jimp";
const white = Jimp.rgbaToInt(255, 255, 255, 255);

const drawRectangle = (
  img: Jimp,
  x1: number,
  y1: number,
  x2: number,
  height: number,
  color?: number,
  fill = true
) => {
  color = color || white;
  if (fill) {
    if (x1 < x2) {
      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y1 + height; y++) {
          img.setPixelColor(color, x, y);
        }
      }
    }
  }
};

export interface Point {
  x: number;
  y: number;
}
interface WriteTextToImageParams {
  imageUrl: string;
  text: string;
  rectData: Point[];
  fontSize: "14" | "17" | "22";
}

export const writeTextToImage = async ({
  imageUrl,
  text,
  rectData,
  fontSize = "17",
}: WriteTextToImageParams) => {
  const [topLeft, topRight, _, bottomLeft] = rectData;
  const image = await Jimp.read(imageUrl);
  const font = await Jimp.loadFont(`fonts/arial${fontSize}.fnt`);

  // Draw white rectangle as background for text
  drawRectangle(
    image,
    topLeft.x,
    topLeft.y,
    topRight.x + 5,
    bottomLeft.y - topLeft.y + 5
  );

  // Print text to image
  image.print(font, topLeft.x, topLeft.y, text, topRight.x - topLeft.x);

  // Save image
  const translatedImagePath = "images/translatedImage.png";
  image.write(translatedImagePath);

  return translatedImagePath;
};
