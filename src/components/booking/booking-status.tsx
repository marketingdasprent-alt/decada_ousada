import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/domain/booking";

import { Badge } from "../shared/ui";

const TONE: Record<BookingStatus, "warn" | "ok" | "info" | "neutral" | "danger"> = {
  pending: "warn",
  confirmed: "ok",
  in_progress: "info",
  completed: "neutral",
  cancelled: "danger",
  no_show: "danger",
  expired: "neutral",
};

export function ReservationStatus({ status }: { status: BookingStatus }) {
  return <Badge tone={TONE[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
