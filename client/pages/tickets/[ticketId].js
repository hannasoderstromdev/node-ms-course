import { useRouter } from "next/router";

import ErrorMessage from "../../components/ErrorMessage";
import useRequest from "../../hooks/use-request";

const TicketShow = ({ ticket }) => {
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      router.push("/orders/[orderId]", `/orders/${order.id}`),
  });

  return (
    <div className="container">
      <h1>Ticket</h1>
      <div className="d-flex flex-row justify-content-between">
        <div>
          <div>Name: {ticket?.title}</div>
          <div>Price: {ticket?.price / 100} USD</div>
        </div>
        <div>
          <ErrorMessage errors={errors} />
          <button className="btn btn-primary" onClick={() => doRequest()}>
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
