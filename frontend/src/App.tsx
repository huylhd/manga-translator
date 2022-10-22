/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import io from "socket.io-client";
import { handleDrawImage, handleDrawText } from "./utils/canvas";
import { ISocketMessage } from "./interfaces/socketMessage";
import { cloneDeep, last } from "lodash";
import { IFormData } from "./interfaces/formData";
const socket = io("http://localhost:1001");

function App() {
  const [formData, setFormData] = useState<IFormData>({
    imageUrl: "",
    fontSize: 20,
    type: "single",
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

  /**
   * Handle form fields change
   */
  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: any) => {
    setImageList([]);
    setTextList([]);
    e.preventDefault();
    axios.post(`http://localhost:1001/${socket.id}`, formData);
  };

  const getText = useCallback(
    (canvasId: string) => textList.find((item) => item.canvasId === canvasId),
    [textList]
  );

  /**
   * Handle manually update translated text
   * @param e
   * @param canvasId
   * @param id
   * @returns
   */
  const handleChangeText = async (e: any, canvasId: string, id: number) => {
    const index = textList.findIndex((item) => item.canvasId === canvasId);
    if (index < 0) return;

    const newTextList = cloneDeep(textList);
    const txtItem = newTextList[index];
    if (!txtItem.textData) return;
    txtItem.isEdited = true;

    let blockIndex = txtItem.textData.findIndex((item) => item.id === id);
    if (blockIndex < 0) return;
    if (e.target.value === "") {
      txtItem.textData.splice(blockIndex, 1);
    } else {
      const block = JSON.parse(e.target.value);
      txtItem.textData[blockIndex] = block;
    }

    newTextList[index] = txtItem;
    setTextList(newTextList);

    // Redraw image
    const imageData = imageList.find((item) => item.canvasId === canvasId);
    if (!imageData) return;
    await handleDrawImage(imageData);
    handleDrawText(txtItem);
  };

  return (
    <div className="App px-5 py-3">
      <Form
        onSubmit={handleSubmit}
        className="mb-5 text-left d-flex flex-row align-items-end"
      >
        <Form.Group className="mb-3 me-3">
          <Form.Label>Type</Form.Label>
          <Form.Select
            value={formData.type}
            name="type"
            onChange={handleChange}
          >
            <option value="single">Single</option>
            <option value="sequence">Sequence</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3 me-3 col-5">
          <Form.Label>Image Url</Form.Label>
          <Form.Control
            type="text"
            value={formData.imageUrl}
            name="imageUrl"
            onChange={handleChange}
            placeholder="Enter Image Url"
          />
        </Form.Group>

        {formData.type === "sequence" && (
          <Form.Group className="mb-3 me-3">
            <Form.Label>Pattern</Form.Label>
            <Form.Control
              type="text"
              value={formData.pattern}
              name="pattern"
              onChange={handleChange}
              placeholder="Enter Pattern"
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3 me-3">
          <Form.Label>Font Size</Form.Label>
          <Form.Control
            type="number"
            value={formData.fontSize}
            name="fontSize"
            onChange={handleChange}
            placeholder="Enter Font Size"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>
      <div>
        {imageList.map((item) => (
          <div
            key={item.canvasId}
            className="d-flex flex-row mb-5 justify-content-between"
          >
            <canvas id={item.canvasId}></canvas>
            <div style={{ width: "370px", maxWidth: "100%" }}>
              <h4>Translated Text</h4>
              {getText(item.canvasId) && (
                <Tabs className="mb-3" justify>
                  {getText(item.canvasId)?.textData?.map((txtItem, index) => (
                    <Tab
                      key={txtItem.id}
                      eventKey={`canvas-${item.canvasId}-tab-${txtItem.id}`}
                      title={txtItem.id}
                    >
                      <Form.Control
                        as="textarea"
                        className="mb-3"
                        style={{ height: "600px" }}
                        value={JSON.stringify(txtItem, null, 1)}
                        onChange={(e) =>
                          handleChangeText(e, item.canvasId, txtItem.id)
                        }
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
