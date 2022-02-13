import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@hs-tickets/common";

import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { getMongoId } from "../../../test/getMongoId";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "Concert",
    price: 200,
    userId: "notRelevantFakeId",
  });

  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: getMongoId(),
    version: 0,
    status: OrderStatus.Created,
    userId: "notRelevantFakeId",
    expiresAt: "notRelevantFakeDateString",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets orderId correctly", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
