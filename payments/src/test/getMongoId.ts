import mongoose from "mongoose";

export const getMongoId = (): string => {
  const ticketId = new mongoose.Types.ObjectId();
  return ticketId.toString();
};
