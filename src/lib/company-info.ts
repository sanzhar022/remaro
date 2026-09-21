export interface CompanyInfo {
  brandName: string;
  companyName: string;
  legalName: string | null;
  bin: string | null;
  legalAddress: string | null;
  city: string;
  address: string | null;
  pickupAddress: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  workingHours: string | null;
  mapUrl: string | null;
  socialLinks: ReadonlyArray<{ label: string; url: string }>;
  delivery: { supported: boolean; area: string; priceText: string; etaText: string };
  pickup: { supported: boolean; detailsText: string };
  payment: { onlineEnabled: boolean; detailsText: string };
}

// Contact details are intentionally nullable until the business confirms them.
// Keeping them here prevents placeholder data from becoming a working public link.
export const companyInfo: CompanyInfo = {
  brandName: "Remaro",
  companyName: "Remaro Group",
  legalName: null,
  bin: null,
  legalAddress: null,
  city: "Алматы",
  address: null,
  pickupAddress: null,
  phone: null,
  whatsapp: null,
  email: null,
  workingHours: null,
  mapUrl: null,
  socialLinks: [],
  delivery: {
    supported: true,
    area: "Алматы",
    priceText: "Стоимость и условия доставки уточняются при подтверждении заказа.",
    etaText: "Срок доставки согласовывается при подтверждении заказа.",
  },
  pickup: {
    supported: true,
    detailsText: "Адрес и время самовывоза уточняются при подтверждении заказа.",
  },
  payment: {
    onlineEnabled: false,
    detailsText: "Онлайн-оплата на сайте временно недоступна. Доступный способ оплаты отображается при оформлении заказа.",
  },
};

export function getWhatsAppUrl(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
