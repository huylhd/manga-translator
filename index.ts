import express from "express";
import * as http from "http";
import { createSocket } from "./utils/socket";
import { getImageSequence, translateImages } from "./utils/translate-image";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);

const io = createSocket(server);
io.on("connection", (socket) => {
  console.log("client connected ", socket.id);
});

app.use("/public", express.static("public"));

/**
 * POST /
 * Request image translation
 */
app.post("/:socketId", (req, res) => {
  const { type, imageUrl, pattern = "", fontSize } = req.body;
  const { socketId } = req.params;
  res.send("OK");
  let imageUrls: string[] = [imageUrl];
  const match = pattern.match(/(\d*)/);
  if (type === "sequence" && match && match.length >= 2) {
    imageUrls = getImageSequence(imageUrl, match[1]);
  }
  return translateImages(imageUrls, fontSize, socketId);
});

const port = process.env.PORT || 1001;
server.listen(port, () => console.log(`app running on ${port}`));
