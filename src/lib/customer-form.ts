import type { Customer } from "@/domain/customer";
import type { CustomerFormValues } from "@/lib/validation";

const country = (c?: string) => (c === "PT" ? "Portugal" : c);

/** Converte a ficha normalizada do WeGest nos valores do formulário. */
export function customerToForm(c: Customer): Partial<CustomerFormValues> {
  return {
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    birthDate: c.birthDate,
    taxId: c.taxId,
    addressLine1: c.address?.line1,
    postalCode: c.address?.postalCode,
    city: c.address?.city,
    country: country(c.address?.country),
    licenseNumber: c.driverLicense?.number,
    licenseCountry: country(c.driverLicense?.country),
    licenseExpiresAt: c.driverLicense?.expiresAt,
  };
}
