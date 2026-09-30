// The bank-native model-97 reference identifies the specific order. The
// purpose adds a human-readable order code and stable user alias for a
// secondary visual check; it is not a substitute for the bank reference.
export function buildPaymentPurpose(
  orderCode: string,
  userCode: string | null | undefined,
  bankReference: string | null | undefined,
): string {
  if (!bankReference || !userCode || !/^ep-[0-9a-f]{16}$/i.test(userCode)) return orderCode
  const purpose = `${orderCode} U:${userCode.toUpperCase()}`
  return purpose.length <= 35 ? purpose : orderCode
}
