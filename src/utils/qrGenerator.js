/**
 * QR Payload and Mobile Sync Helpers
 */

export const generateSessionId = () => {
  return "INSTA-" + Math.random().toString(36).substring(2, 9).toUpperCase();
};

export const generateUPIPayload = ({ amount = "1.00", transactionId = "TXN001", merchant = "InstaPrint Express" }) => {
  const vpa = "instaprint@upi";
  const name = encodeURIComponent(merchant);
  return `upi://pay?pa=${vpa}&pn=${name}&tr=${transactionId}&tn=Instant%20Print%20Order&am=${amount}&cu=INR`;
};

export const generateMobilePairUrl = (sessionId) => {
  return `https://instaprint.app/sync?session=${sessionId}&terminal=PRINT-BLR-04`;
};
