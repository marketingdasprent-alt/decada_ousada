import "server-only";

import type { Booking } from "@/domain/booking";
import type { TvdeApplication } from "@/domain/application";
import { getCustomerId, getSession, type Session } from "@/services/auth";
import { getApplication, getBooking } from "@/services/wegest";

/** Garante que a reserva pertence ao utilizador autenticado. */
export async function getOwnBooking(bookingId: string): Promise<{ session: Session; booking: Booking } | null> {
  const session = await getSession();
  const customerId = await getCustomerId(session, "rentacar");
  if (!session || !customerId) return null;
  const booking = await getBooking(bookingId);
  if (!booking || booking.customerId !== customerId) return null;
  return { session, booking };
}

/** Garante que a candidatura TVDE pertence ao utilizador autenticado. */
export async function getOwnApplication(applicationId: string): Promise<{ session: Session; application: TvdeApplication } | null> {
  const session = await getSession();
  const customerId = await getCustomerId(session, "tvde");
  if (!session || !customerId) return null;
  const application = await getApplication(applicationId);
  if (!application || application.customerId !== customerId) return null;
  return { session, application };
}
