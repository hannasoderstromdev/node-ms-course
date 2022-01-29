import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => (
  <div className="container">
    <h1>Landing Page</h1>
    <div>
      {currentUser ? <p>You are signed in.</p> : <p>You are not signed in.</p>}
    </div>
  </div>
);

LandingPage.getInitialProps = async (context) => {
  // On initial server-side render
  try {
    const client = buildClient(context);
    const { data } = await client.get("/api/users/currentuser");
    return { currentUser: data.currentUser };
  } catch (error) {
    console.error(error);
    return {};
  }
};

export default LandingPage;
