import express from "express";
import * as fs from "fs";
import { getTranslatedImage } from "./translate-image";

const app = express();

// Create images folder
if (!fs.existsSync("public/translated-images")) {
  fs.mkdirSync("public/translated-images");
}

// Template engine
app.engine("ntl", (filePath, options: any, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    let rendered = content.toString();
    [
      "formField",
      "imageUrl",
      "translatedImageUrl",
      "translatedText",
      "lang",
      "type",
    ].forEach((k) => (rendered = rendered.replace(`#${k}#`, options[k])));
    return callback(null, rendered);
  });
});
app.set("views", "./views"); // specify the views directory
app.set("view engine", "ntl"); // register the template engine
app.use("/public", express.static("public"));

app.get("/", async (req, res) => {
  let {
    imageUrl = "",
    lang = "en",
    type = "paragraph",
    save = false,
  } = req.query;
  let translatedText = "",
    translatedImageUrl = imageUrl;
  try {
    if (imageUrl) {
      const translatedRes = await getTranslatedImage({
        imageUrl: imageUrl as string,
        type: type as "block" | "paragraph",
        lang: lang as "en" | "vi",
        save: !!save,
      });
      translatedImageUrl = translatedRes.imageUrl;
      translatedText = translatedRes.translatedText;
    }
  } catch (err) {
    console.log(err);
  }

  return res.render("index", {
    formField: imageUrl,
    imageUrl:
      imageUrl ||
      "https://s3-alpha.figma.com/hub/file/948140848/1f4d8ea7-e9d9-48b7-b70c-819482fb10fb-cover.png",
    translatedImageUrl:
      translatedImageUrl ||
      "https://s3-alpha.figma.com/hub/file/948140848/1f4d8ea7-e9d9-48b7-b70c-819482fb10fb-cover.png",
    translatedText: translatedText,
    lang,
    type,
  });
});

const port = process.env.PORT || 1001;
app.listen(port, () => console.log(`app running on ${port}`));
