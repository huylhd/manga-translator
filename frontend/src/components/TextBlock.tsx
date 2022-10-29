import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { ITextData } from "../interfaces/socketMessage";

interface Props {
  canvasId: string;
  block: ITextData;
  handleUpdateText: (
    e: any,
    canvasId: string,
    blockId: number,
    pos: "text" | "x1" | "x2" | "y1" | "y2" | "delete"
  ) => void;
}

export const TextBlock = ({ canvasId, block, handleUpdateText }: Props) => {
  return (
    <>
      <Form.Group className="mb-3">
        <h5>Text</h5>
        <Form.Control
          as="textarea"
          value={block.text}
          onChange={(e) => handleUpdateText(e, canvasId, block.id, "text")}
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
              onChange={(e) => handleUpdateText(e, canvasId, block.id, "x1")}
            />
          </div>
          <div className="col-6 mb-3">
            <Form.Label>x2</Form.Label>
            <Form.Control
              type="number"
              value={block.vertices[1].x}
              onChange={(e) => handleUpdateText(e, canvasId, block.id, "x2")}
            />
          </div>
          <div className="col-6 mb-3">
            <Form.Label>y1</Form.Label>
            <Form.Control
              type="number"
              value={block.vertices[1].y}
              onChange={(e) => handleUpdateText(e, canvasId, block.id, "y1")}
            />
          </div>
          <div className="col-6 mb-3">
            <Form.Label>y2</Form.Label>
            <Form.Control
              type="number"
              value={block.vertices[2].y}
              onChange={(e) => handleUpdateText(e, canvasId, block.id, "y2")}
            />
          </div>
        </div>
      </Form.Group>
      <Form.Group
        onClick={(e) => handleUpdateText(e, canvasId, block.id, "delete")}
        className="text-center"
      >
        <Button className="text-right" variant="danger">
          Delete Text
        </Button>
      </Form.Group>
    </>
  );
};
