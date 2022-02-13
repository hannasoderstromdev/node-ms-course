import { OrderCreatedEvent, OrderStatus } from "@hs-tickets/common";
import { Message } from "node-nats-streaming";

import { getMongoId } from "./../../../test/getMongoId";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: getMongoId(),
    version: 0,
    expiresAt: "notRelevantFakeDate",
    userId: "notRelevantFakeUserId",
    status: OrderStatus.Created,
    ticket: {
      id: "notRelevantFakeId",
      price: 200,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates order data", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.id).toEqual(data.id);
});

it("acknowledges the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
