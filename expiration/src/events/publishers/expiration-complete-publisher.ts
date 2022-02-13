import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@hs-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
