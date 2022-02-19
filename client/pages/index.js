import Link from "next/link";

const Tickets = ({ tickets }) =>
  tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ));

const LandingPage = ({ currentUser, tickets }) => (
  <div className="container">
    {currentUser ? (
      <div>
        <h1>Tickets</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Tile</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <Tickets tickets={tickets} />
          </tbody>
        </table>
      </div>
    ) : (
      <h1>Not signed in</h1>
    )}
  </div>
);

LandingPage.getInitialProps = async (context, client, currentUser) => {
  // On initial server-side render
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};

export default LandingPage;
