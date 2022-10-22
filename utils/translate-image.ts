import to from "await-to-js";
import axios from "axios";
import { ITextBlock } from "../interfaces";
import { getSocket } from "./socket";
import { getTextFromImage, translateText } from "./gcloud";

export const translateImages = async (
  imageUrls: string[],
  fontSize: number,
  socketId: string
) => {
  const io = getSocket();
  for (let index = 0; index < imageUrls.length; index++) {
    const imageUrl = imageUrls[index];
    const canvasId = `canvas-${index}`;
    const [err, response] = await to(
      axios.get(imageUrl, {
        responseType: "arraybuffer",
      })
    );
    if (err) {
      break;
    }
    const base64Str = Buffer.from(response.data, "binary").toString("base64");
    io.sockets.to(socketId).emit(
      "message",
      JSON.stringify({
        type: "image",
        canvasId,
        base64Str,
      })
    );
    getTextFromImage(base64Str).then(async (result: ITextBlock[]) => {
      result = await Promise.all(
        result.map(async (block: any, index) => {
          block.text = await translateText(block.text);
          block.id = index;
          block.fontSize = fontSize;
          return block;
        })
      );
      return io.sockets.to(socketId).emit(
        "message",
        JSON.stringify({
          type: "text",
          canvasId,
          textData: result,
          base64Str,
        })
      );
    });
  }
};

export const getImageSequence = (
  imageUrl: string,
  initialNumberStr: string,
  limit: number = 50
) => {
  const imageUrls: string[] = [];
  let currentNumber = +initialNumberStr;
  for (let index = 0; index < limit; index++) {
    currentNumber++;
    const nextImageUrl = imageUrl.replace(
      initialNumberStr,
      String(currentNumber).padStart(initialNumberStr.length, "0")
    );
    imageUrls.push(nextImageUrl);
  }
  return imageUrls;
};
