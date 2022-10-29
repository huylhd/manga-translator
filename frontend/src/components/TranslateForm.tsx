import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFormContext } from "react-hook-form";
import { IFormData } from "../interfaces/formData";

export const TranslateForm = ({ onSubmit }: { onSubmit: any }) => {
  const { handleSubmit, register, watch } = useFormContext<IFormData>();
  const type = watch("type");

  return (
    <Form
      onSubmit={(e) => handleSubmit(onSubmit)(e)}
      className="mb-5 text-left d-flex flex-row align-items-end"
    >
      <Form.Group className="mb-3 me-3">
        <Form.Label>Type</Form.Label>
        <Form.Select {...register("type")} name="type">
          <option value="single">Single</option>
          <option value="sequence">Sequence</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3 me-3 col-5">
        <Form.Label>Image Url</Form.Label>
        <Form.Control
          type="text"
          {...register("imageUrl")}
          name="imageUrl"
          placeholder="Enter Image Url"
        />
      </Form.Group>

      {type === "sequence" && (
        <Form.Group className="mb-3 me-3">
          <Form.Label>Pattern</Form.Label>
          <Form.Control
            type="text"
            {...register("pattern")}
            name="pattern"
            placeholder="Enter Pattern"
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3 me-3 col-1">
        <Form.Label>Language</Form.Label>
        <Form.Select {...register("target")} name="target">
          <option value="en">English</option>
          <option value="vi">Vietnamese</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3 me-3">
        <Form.Label>Font Size</Form.Label>
        <Form.Control
          type="number"
          {...register("fontSize")}
          name="fontSize"
          placeholder="Enter Font Size"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form.Group>
    </Form>
  );
};
