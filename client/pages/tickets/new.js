import { useState } from "react";
import { useRouter } from "next/router";

import useRequest from "../../hooks/use-request";
import ErrorMessage from "../../components/ErrorMessage";

const NewTicket = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => router.push("/"),
  });

  const onBlur = () => {
    const value = parseInt(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(0));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit} className="container">
      <h1>Create a Ticket</h1>
      <div className="form-group">
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control"
        />
        <ErrorMessage errors={errors} field="title" />
      </div>
      <div className="form-group">
        <label>Price (cents)</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={onBlur}
          className="form-control"
        />
        <ErrorMessage errors={errors} field="price" />
      </div>
      <button className="btn btn-primary">Submit</button>
    </form>
  );
};

export default NewTicket;
