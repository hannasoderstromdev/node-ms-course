import { useState } from "react";
import axios from "axios";

const ErrorMessage = ({ errors, field }) => {
  return (
    errors.length > 0 &&
    errors.map(
      (error) =>
        error.field === field && (
          <div key={error.message} className="alert alert-danger">
            <div>{error.message}</div>
          </div>
        )
    )
  );
};

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/users/signup", {
        email,
        password,
      });
      console.log(response.data);
    } catch (error) {
      setErrors(error.response.data.errors);
    }
  };

  return (
    <form onSubmit={onSubmit} className="container">
      <h1>Signup</h1>
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
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};

export default Signup;
