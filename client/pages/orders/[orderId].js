import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { useRouter } from "next/router";

import useRequest from "../../hooks/use-request";
import ErrorMessage from "../../components/ErrorMessage";

const OrderShow = ({ order }) => {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msRemaining = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msRemaining / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // on unmount
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return (
      <div className="container">
        <h1>Order Purchase</h1>
        <p>Order has expired.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Order Purchase</h1>
      <p>Expires in {timeLeft} seconds.</p>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_live_51KUpmgK31cXZpCcshn3kyDGf967B9KzOij5QgQIgndXglyATQOYqh3BVD0Clxpp6kNR8cMv9IcbMsQB6N0fFYVqW00eoqqLzXF"
        amount={order.price}
      />
      <ErrorMessage errors={errors} />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
