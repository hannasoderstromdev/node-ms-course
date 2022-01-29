import { useState } from "react";
import Router from "next/router";

import useRequest from "../../hooks/use-request";
import ErrorMessage from "../../components/ErrorMessage";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: { email, password },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit} className="container">
      <h1>Sign in</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
        <ErrorMessage errors={errors} field="email" />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
        />
        <ErrorMessage errors={errors} field="password" />
      </div>
      <button className="btn btn-primary">Sign In</button>
    </form>
  );
};

export default Signin;
