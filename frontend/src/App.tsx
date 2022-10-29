/* eslint-disable no-delete-var */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import io from "socket.io-client";
import { handleDrawImage, handleDrawText } from "./utils/canvas";
import { ISocketMessage } from "./interfaces/socketMessage";
import { last } from "lodash";
import { IFormData } from "./interfaces/formData";
import { useForm, FormProvider } from "react-hook-form";
import { TranslateForm } from "./components/TranslateForm";
import { TextBlock } from "./components/TextBlock";

const baseApiPath: string =
  process.env.REACT_APP_BASE_API || "http://localhost:1001";
const socket = io(baseApiPath);

function App() {
  const methods = useForm<IFormData>({
    defaultValues: {
      imageUrl: "",
      fontSize: 20,
      type: "single",
      target: "en",
    },
  });
  const [imageList, setImageList] = useState<ISocketMessage[]>([]);
  const [textList, setTextList] = useState<ISocketMessage[]>([]);

  useEffect(() => {
    socket.on("connect", () => console.log("socket connected"));

    socket.on("message", (message) => {
      const data: ISocketMessage = JSON.parse(message);
      if (data.type === "image") {
        setImageList((prevState) => [...prevState, data]);
      } else {
        setTextList((prevState) => [...prevState, data]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  /**
   * New image added
   */
  useEffect(() => {
    const data = last(imageList);
    if (!data) return;
    handleDrawImage(data);
  }, [last(imageList)]);

  /**
   * New text added
   */
  useEffect(() => {
    const data = last(textList);
    if (!data || data.isEdited) return;
    handleDrawText(data);
  }, [last(textList)]);

  const onSubmit = (data: IFormData, e: any) => {
    setImageList([]);
    setTextList([]);
    e.preventDefault();
    axios.post(`${baseApiPath}/${socket.id}`, data);
  };

  const getTextItem = useCallback(
    (canvasId: string) => textList.find((item) => item.canvasId === canvasId),
    [textList]
  );

  const handleUpdateText = (
    e: any,
    canvasId: string,
    blockId: number,
    pos: "text" | "x1" | "x2" | "y1" | "y2" | "delete"
  ) => {
    let val = e.target.value;
    if (pos !== "text") {
      val = Number(val);
    }
    const newTextList = [...textList];
    const txtItem = newTextList.find((item) => item.canvasId === canvasId);
    if (!txtItem) {
      return;
    }
    const blockItem = txtItem.textData.find((bl) => bl.id === blockId);
    if (!blockItem) {
      return;
    }
    switch (pos) {
      case "text":
        blockItem.text = val;
        break;
      case "x1":
        blockItem.vertices[0].x = val;
        break;
      case "x2":
        blockItem.vertices[1].x = val;
        break;
      case "y1":
        blockItem.vertices[1].y = val;
        break;
      case "y2":
        blockItem.vertices[2].y = val;
        break;
      case "delete":
        txtItem.textData = txtItem.textData.filter(
          (bl) => bl.id !== blockItem.id
        );
        break;
      default:
        return;
    }
    setTextList(newTextList);
    redrawText(canvasId, txtItem);
  };

  const redrawText = async (canvasId: string, txtItem: ISocketMessage) => {
    const imageData = imageList.find((item) => item.canvasId === canvasId);
    if (!imageData) {
      return;
    }
    await handleDrawImage(imageData);
    handleDrawText(txtItem);
  };

  return (
    <div className="App px-5 py-3">
      <FormProvider {...methods}>
        <TranslateForm onSubmit={onSubmit} />
      </FormProvider>
      <div>
        {imageList.map((item) => (
          <div key={item.canvasId} className="d-flex flex-row mb-5">
            <canvas id={item.canvasId}></canvas>
            <div className="ms-5" style={{ width: "370px", maxWidth: "100%" }}>
              <h4>Translated Text</h4>
              {getTextItem(item.canvasId) && (
                <Tabs className="mb-3" justify>
                  {getTextItem(item.canvasId)?.textData.map((block) => (
                    <Tab
                      key={block.id}
                      eventKey={`canvas-${item.canvasId}-tab-${block.id}`}
                      title={block.id}
                    >
                      <TextBlock
                        handleUpdateText={handleUpdateText}
                        block={block}
                        canvasId={item.canvasId}
                      />
                    </Tab>
                  ))}
                </Tabs>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
