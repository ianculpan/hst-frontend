import authenticator from 'otplib';
import QRCode from 'qrcode';

const authHelper = {
  isLoggedIn: () => !!localStorage.getItem('auth_token'),

  login: (token) => {
    console.log('login token : ' + token);
    localStorage.setItem('auth_token', token);
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },
  getQrcode: async (data) => {
    console.log(JSON.stringify(data));

    // Use qr_code_url from API response if available, otherwise generate from secret
    let otpauthUrl;
    if (data.qr_code_url) {
      otpauthUrl = data.qr_code_url;
    } else if (data.secret) {
      // Fallback: generate otpauth URL if API doesn't provide it
      // Extract email/username from data if available, otherwise use a default
      const accountName = data.email || data.username || data.name || 'User';
      const issuer = data.issuer || 'Laravel';
      otpauthUrl = authenticator.keyuri(accountName, issuer, data.secret);
    } else {
      console.error('No qr_code_url or secret provided');
      return null;
    }

    try {
      const qrcode = await QRCode.toDataURL(otpauthUrl);
      return qrcode;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  },
};

export default authHelper;
