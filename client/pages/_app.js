import "bootstrap/dist/css/bootstrap.css";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";

import buildClient from "../api/build-client";
import Header from "../components/Header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <div>
        <Header currentUser={currentUser} />
        <Component {...pageProps} />
        <footer>(c) 2022 by Hanna Söderström</footer>
      </div>
    </I18nextProvider>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  try {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get("/api/users/currentuser");

    let pageProps = {};

    if (appContext.Component.getInitialProps) {
      pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    }

    return { currentUser: data.currentUser, pageProps };
  } catch (error) {
    console.error(error);
    return {};
  }
};

export default AppComponent;
