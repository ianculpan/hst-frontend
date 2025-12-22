import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext.js';
import authHelper from '../../helpers/authHelper.js';

export default function TwoFactorChallenge({ code, onCodeChange }) {
  const { needsTwoFactor, needsTwoFactorSetup, twoFactorSetupData } = useAuth();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);

  // Generate QR code from setup data
  useEffect(() => {
    if (needsTwoFactorSetup && twoFactorSetupData) {
      const generateQrCode = async () => {
        const qrCode = await authHelper.getQrcode(twoFactorSetupData);
        setQrCodeDataUrl(qrCode);
      };
      generateQrCode();
    }
  }, [needsTwoFactorSetup, twoFactorSetupData]);

  return (
    <div>
      {needsTwoFactorSetup && (
        <div className="flex flex-col gap-2 items-center mx-16">
          <h3>Setup Two-Factor Authentication</h3>
          {twoFactorSetupData?.message && (
            <p className="text-sm text-brand-600 mb-4">{twoFactorSetupData.message}</p>
          )}
          {qrCodeDataUrl ? (
            <>
              <img src={qrCodeDataUrl} alt="Two Factor QR Code" className="max-w-xs mb-4" />
              <div className="flex flex-row items-center gap-2">
                <label htmlFor="twoFactorCode" className="text-sm font-medium text-brand-400 w-20">
                  Code
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  className="flex-1 border-2 border-brand-400 rounded-md p-2"
                />
              </div>
            </>
          ) : (
            <p className="text-brand-500 mb-4">Generating QR code...</p>
          )}
        </div>
      )}

      {needsTwoFactor && (
        <div className="flex flex-col items-center gap-2">
          <h3>Two-Factor Authentication</h3>
          <div className="flex flex-row items-center gap-2">
            <label htmlFor="twoFactorCode" className="text-sm font-medium text-brand-400 w-20">
              Code
            </label>
            <input
              type="text"
              id="twoFactorCode"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              className="flex-1 border-2 border-brand-400 rounded-md p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
