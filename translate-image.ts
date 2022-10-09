import axios, { AxiosResponse } from "axios";
import * as fs from "fs";
import { encode } from "url-safe-base64";
import * as dotenv from "dotenv";
import { map } from "lodash";
import { Point, writeTextToImage } from "./image-helper";
dotenv.config();

const request = require("request").defaults({ encoding: null });
const apiKey = process.env.API_KEY;

interface GetTranslatedImageParams {
  imageUrl: string;
  type: "block" | "paragraph";
  lang: "en" | "vi";
  save: boolean;
}

export const getTranslatedImage = ({
  imageUrl,
  type = "paragraph",
  lang = "en",
  save = true,
}: GetTranslatedImageParams): Promise<{
  imageUrl: string;
  translatedText: string;
}> => {
  // Base64 encode for url to save
  const filename = encode(Buffer.from(imageUrl).toString("base64"));
  const saveImageUrl = `public/translated-images/${lang}_${type}_${filename}.png`;

  // Try to find saved image
  try {
    fs.readFileSync(saveImageUrl);
    return Promise.resolve({
      imageUrl: saveImageUrl,
      translatedText: "",
    });
  } catch {}

  return new Promise((resolve) => {
    request.get(imageUrl, function (error: any, response: any, body: any) {
      if (!error && response.statusCode == 200) {
        const data = Buffer.from(body).toString("base64");
        axios
          .post(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
              requests: [
                {
                  features: [{ type: "TEXT_DETECTION" }],
                  image: {
                    content: data,
                  },
                },
              ],
            }
          )
          .then(async (textDetectionResponse) => {
            let textParagraphs: any[] = [];
            let translatedText = "";
            const blocks = (textDetectionResponse as AxiosResponse).data
              .responses[0].fullTextAnnotation.pages[0].blocks;
            if (type === "block") {
              // Translate by BLOCKS
              for (const block of blocks) {
                let text = "";
                for (const para of block.paragraphs) {
                  para.words.forEach((word: any) => {
                    const textArr = map(word.symbols, "text");
                    text += textArr.join(" ");
                  });
                  text += ".\n";
                }
                const rectData = block.boundingBox.vertices;

                // Write translated text to block
                const translatedBlock = await writeBlock(
                  imageUrl,
                  text,
                  rectData,
                  lang
                );
                imageUrl = translatedBlock.imageUrl;
                translatedText += `<br/>${translatedBlock.translatedText}`;
              }
            } else {
              // Translate by PARAGRAPHS
              blocks.forEach((block: any) => {
                const paragraphs = block.paragraphs;
                textParagraphs = [...textParagraphs, ...paragraphs];
              });
              for (const para of textParagraphs) {
                let text = "";
                para.words.forEach((word: any) => {
                  const textArr = map(word.symbols, "text");
                  text += textArr.join(" ");
                });
                const rectData = para.boundingBox.vertices;

                // Write translated text to block
                const translatedBlock = await writeBlock(
                  imageUrl,
                  text,
                  rectData,
                  lang
                );
                imageUrl = translatedBlock.imageUrl;
                translatedText += `<br/>${translatedBlock.translatedText}`;
              }
            }
            if (save) {
              // Rename image
              fs.renameSync(imageUrl, saveImageUrl);
              return resolve({ imageUrl: saveImageUrl, translatedText });
            } else {
              return resolve({ imageUrl, translatedText });
            }
          })
          .catch((err) => {
            console.log(err);
            return resolve({ imageUrl: "", translatedText: "" });
          });
      }
    });
  });
};

async function writeBlock(
  imageUrl: string,
  text: string,
  rectData: Point[],
  lang: "en" | "vi"
) {
  text = encodeURI(text);
  const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&format=text&target=${lang}&q=${text}`;
  const translatedRes = await axios.get(translateUrl);
  const translatedText: string =
    translatedRes.data.data.translations[0].translatedText;
  imageUrl = await writeTextToImage({
    imageUrl,
    text: translatedText,
    rectData,
    fontSize: "17",
  });
  return { imageUrl, translatedText };
}
