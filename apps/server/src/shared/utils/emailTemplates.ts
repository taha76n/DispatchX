interface VerificationEmailTemplateParams {
  name: string;
  verificationUrl: string;
}

export const verificationEmailTemplate = ({
  name,
  verificationUrl,
}: VerificationEmailTemplateParams): string => {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EE; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #14171C; padding: 24px 32px;">
              <span style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #F5F3EE;">
                DispatchX
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-family: Arial, sans-serif; color: #14171C; margin: 0 0 8px;">
                Hi ${name}, confirm your email
              </h2>
              <p style="font-family: Arial, sans-serif; font-size: 14px; color: #73726C; margin: 0 0 24px; line-height: 1.6;">
                Thanks for signing up for DispatchX. Click the button below to verify your email address and activate your account.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius: 6px; background-color: #E8873A;">
                    <a href="${verificationUrl}"
                       style="display: inline-block; padding: 12px 28px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #FFFFFF; text-decoration: none;">
                      Verify email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #8A8F98; margin: 24px 0 0; line-height: 1.6;">
                Or paste this link into your browser:<br />
                <a href="${verificationUrl}" style="color: #4FD1C5; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F5F3EE; padding: 16px 32px;">
              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #8A8F98; margin: 0;">
                This link expires shortly. If you didn't create a DispatchX account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

interface OrderPlacedTemplateParams {
  customerName: string;
  restaurantName: string;
  items: { itemName: string; quantity: number; itemPrice: number }[];
  totalPrice: number;
  orderId: string;
}

const formatPrice = (paisa: number) => `Rs. ${(paisa / 100).toFixed(2)}`;

export const orderPlacedTemplate = ({
  customerName,
  restaurantName,
  items,
  totalPrice,
  orderId,
}: OrderPlacedTemplateParams): string => {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; color: #3D3D3A; font-family: Arial, sans-serif; font-size: 14px;">
            ${item.quantity} × ${item.itemName}
          </td>
          <td align="right" style="padding: 8px 0; color: #3D3D3A; font-family: Arial, sans-serif; font-size: 14px;">
            ${formatPrice(item.itemPrice * item.quantity)}
          </td>
        </tr>`
    )
    .join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EE; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #14171C; padding: 24px 32px;">
              <span style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #F5F3EE;">
                DispatchX
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-family: Arial, sans-serif; color: #14171C; margin: 0 0 8px;">
                Order confirmed, ${customerName}!
              </h2>
              <p style="font-family: Arial, sans-serif; font-size: 14px; color: #73726C; margin: 0 0 24px;">
                ${restaurantName} has received your order #${orderId.slice(-6)}.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #E5E3DC; border-bottom: 1px solid #E5E3DC; margin-bottom: 16px;">
                ${itemRows}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #14171C;">
                    Total
                  </td>
                  <td align="right" style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #14171C;">
                    ${formatPrice(totalPrice)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F5F3EE; padding: 16px 32px;">
              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #8A8F98; margin: 0;">
                You'll get another email once ${restaurantName} accepts your order.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};