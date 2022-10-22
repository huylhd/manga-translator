import * as vision from "@google-cloud/vision";
import { GoogleAuth, grpc } from "google-gax";
import * as dotenv from "dotenv";
import { Translate } from "@google-cloud/translate/build/src/v2";
import { get, map } from "lodash";
import { ITextBlock } from "../interfaces";
dotenv.config();

const apiKey = process.env.API_KEY;

/**
 * Get sslCreds for gcloud client
 * @returns credentials
 */
const getApiKeyCredentials = () => {
  const sslCreds = grpc.credentials.createSsl();
  const googleAuth = new GoogleAuth();
  const authClient = googleAuth.fromAPIKey(apiKey as string);
  const credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    grpc.credentials.createFromGoogleCredential(authClient)
  );
  return credentials;
};

const client = new vision.ImageAnnotatorClient({
  sslCreds: getApiKeyCredentials(),
});
const translate = new Translate({ key: apiKey });

/**
 *
 * @param base64Str
 */
export const getTextFromImage = async (
  base64Str: string
): Promise<ITextBlock[]> => {
  const requests: any = [
    {
      features: [{ type: "TEXT_DETECTION" }],
      image: {
        content: Buffer.from(base64Str, "base64"),
      },
    },
  ];
  const results: any = await client.batchAnnotateImages({ requests });
  const blocks = get(
    results,
    "0.responses.0.fullTextAnnotation.pages.0.blocks",
    []
  );
  if (!blocks.length) {
    return [];
  }
  return blocks.map((block: any) => {
    const text = block.paragraphs.reduce((acc: string, para: any) => {
      para.words.forEach((word: any) => {
        const textArr = map(word.symbols, "text");
        acc += textArr.join(" ");
      });
      return acc;
    }, "");
    const vertices = block.boundingBox.vertices;
    return { text, vertices };
  });
};

/**
 *
 * @param text
 * @param target
 * @returns translation
 */
export const translateText = async (text: string, target = "en") => {
  const [translation] = await translate.translate(text, target);
  return translation;
};
