import { Message } from "node-nats-streaming";
import { OrderCancelledEvent } from "@hs-tickets/common";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { getMongoId } from "../../../test/getMongoId";
import { OrderCancelledListener } from "./../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: "Concert",
    price: 200,
    userId: "notRelevantFakeUserId",
  });
  const orderId = getMongoId();
  ticket.set({ orderId });

  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, orderId, data, msg };
};

it("updates the ticket", async () => {
  const { listener, ticket, orderId, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).not.toBeDefined();
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes an ticket updated event", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // @ts-ignore
  const eventSubject = natsWrapper.client.publish.mock.calls[0][0];
  expect(eventSubject).toEqual("ticket:updated");

  // @ts-ignore
  const updatedData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1]);
  expect(updatedData.orderId).not.toBeDefined();
});
