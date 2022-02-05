import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import useRequest from "../../hooks/use-request";
import ErrorMessage from "../../components/ErrorMessage";

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t, i18n } = useTranslation();

  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: { email, password },
    onSuccess: () => router.push("/"),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit} className="container">
      <h1>{t("sign-in.title")}</h1>
      <div className="form-group">
        <label>{t("fields.email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
        <ErrorMessage errors={errors} field="email" />
      </div>
      <div className="form-group">
        <label>{t("fields.password")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
        />
        <ErrorMessage errors={errors} field="password" />
      </div>
      <button className="btn btn-primary">{t("sign-in.cta")}</button>
    </form>
  );
};

export default Signin;
