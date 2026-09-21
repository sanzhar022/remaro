import assert from "node:assert/strict";
import { siteSettingsSchema } from "../src/lib/site-settings-schema";

const valid = {
  companyName: "Remaro",
  shortDescription: "",
  phone: "",
  whatsapp: "",
  email: "",
  workingHours: "",
  city: "",
  address: "",
  latitude: "",
  longitude: "",
  instagramUrl: "",
  tiktokUrl: "",
  aboutTitle: "",
  aboutShortText: "",
  aboutText: "",
};

assert.equal(siteSettingsSchema.safeParse(valid).success, true, "empty optional fields must be accepted");
assert.equal(siteSettingsSchema.safeParse({ ...valid, email: "not-an-email" }).success, false, "invalid email must be rejected");
assert.equal(siteSettingsSchema.safeParse({ ...valid, instagramUrl: "javascript:alert(1)" }).success, false, "unsafe social URL must be rejected");
assert.equal(siteSettingsSchema.safeParse({ ...valid, instagramUrl: "https://example.com/profile" }).success, false, "wrong social host must be rejected");
assert.equal(siteSettingsSchema.safeParse({ ...valid, latitude: "91", longitude: "76" }).success, false, "invalid latitude must be rejected");
assert.equal(siteSettingsSchema.safeParse({ ...valid, latitude: "43.2", longitude: "181" }).success, false, "invalid longitude must be rejected");
assert.equal(siteSettingsSchema.safeParse({ ...valid, latitude: "43.2", longitude: "" }).success, false, "partial coordinates must be rejected");

console.log("site-settings-schema: PASS");
