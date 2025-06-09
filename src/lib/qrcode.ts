import QRCode from 'qrcode';

// Generate QR code for agent or employee ratings
export async function generateRatingQRCode(userId: string, role: 'agent' | 'employee'): Promise<string> {
  try {
    const baseUrl = process.env.QR_CODE_BASE_URL || 'http://localhost:3000/rate';
    const url = `${baseUrl}/${role}/${userId}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#f44336', // Alliance red
        light: '#ffffff' // White
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Parse QR code URL to extract role and ID
export function parseRatingQRCode(url: string): { role: 'agent' | 'employee', id: string } | null {
  try {
    const baseUrl = process.env.QR_CODE_BASE_URL || 'http://localhost:3000/rate';

    // Check if URL starts with the correct base
    if (!url.startsWith(baseUrl)) {
      return null;
    }

    // Extract path segments
    const path = url.substring(baseUrl.length);
    const segments = path.split('/').filter(segment => segment.length > 0);

    if (segments.length === 2) {
      const [role, id] = segments;
      if ((role === 'agent' || role === 'employee') && id) {
        return { role: role as 'agent' | 'employee', id };
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing QR code URL:', error);
    return null;
  }
}