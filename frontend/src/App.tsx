/* eslint-disable no-delete-var */
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
import { last } from "lodash";
import { IFormData } from "./interfaces/formData";

const baseApiPath: string =
  process.env.REACT_APP_BASE_API || "http://localhost:1001";
const socket = io(baseApiPath);

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
    axios.post(`${baseApiPath}/${socket.id}`, formData);
  };

  const getText = useCallback(
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
    console.log(newTextList);
    setTextList(newTextList);
    redrawText(canvasId, txtItem);
  };

  const redrawText = async (canvasId: string, txtItem: ISocketMessage) => {
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
          <div key={item.canvasId} className="d-flex flex-row mb-5">
            <canvas id={item.canvasId}></canvas>
            <div className="ms-5" style={{ width: "370px", maxWidth: "100%" }}>
              <h4>Translated Text</h4>
              {getText(item.canvasId) && (
                <Tabs className="mb-3" justify>
                  {getText(item.canvasId)?.textData.map((block) => (
                    <Tab
                      key={block.id}
                      eventKey={`canvas-${item.canvasId}-tab-${block.id}`}
                      title={block.id}
                    >
                      <Form.Group className="mb-3">
                        <h5>Text</h5>
                        <Form.Control
                          as="textarea"
                          value={block.text}
                          onChange={(e) =>
                            handleUpdateText(e, item.canvasId, block.id, "text")
                          }
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <h5>Position</h5>
                        <div className="row">
                          <div className="col-6 mb-3">
                            <Form.Label>x1</Form.Label>
                            <Form.Control
                              type="number"
                              value={block.vertices[0].x}
                              onChange={(e) =>
                                handleUpdateText(
                                  e,
                                  item.canvasId,
                                  block.id,
                                  "x1"
                                )
                              }
                            />
                          </div>
                          <div className="col-6 mb-3">
                            <Form.Label>x2</Form.Label>
                            <Form.Control
                              type="number"
                              value={block.vertices[1].x}
                              onChange={(e) =>
                                handleUpdateText(
                                  e,
                                  item.canvasId,
                                  block.id,
                                  "x2"
                                )
                              }
                            />
                          </div>
                          <div className="col-6 mb-3">
                            <Form.Label>y1</Form.Label>
                            <Form.Control
                              type="number"
                              value={block.vertices[1].y}
                              onChange={(e) =>
                                handleUpdateText(
                                  e,
                                  item.canvasId,
                                  block.id,
                                  "y1"
                                )
                              }
                            />
                          </div>
                          <div className="col-6 mb-3">
                            <Form.Label>y2</Form.Label>
                            <Form.Control
                              type="number"
                              value={block.vertices[2].y}
                              onChange={(e) =>
                                handleUpdateText(
                                  e,
                                  item.canvasId,
                                  block.id,
                                  "y2"
                                )
                              }
                            />
                          </div>
                        </div>
                      </Form.Group>
                      <Form.Group
                        onClick={(e) =>
                          handleUpdateText(e, item.canvasId, block.id, "delete")
                        }
                        className="text-center"
                      >
                        <Button className="text-right" variant="danger">
                          Delete Text
                        </Button>
                      </Form.Group>
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
