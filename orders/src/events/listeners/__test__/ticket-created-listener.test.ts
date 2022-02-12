import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@hs-tickets/common";

import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { getMongoId } from "../../../test/getMongoId";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create listener instance
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create fake data event
  const data: TicketCreatedEvent["data"] = {
    id: getMongoId(),
    version: 0,
    title: "Concert",
    price: 100,
    userId: getMongoId(),
  };
  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
