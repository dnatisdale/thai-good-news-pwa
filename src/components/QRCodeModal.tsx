import { QRCodeCanvas } from 'qrcode.react';
import { t } from '@/lib/i18n';

export default function QRCodeModal({
  url,
  onClose
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal
    >
      <div className="card w-full max-w-md flex flex-col items-center gap-3">
        {/* Larger size (320). Scales nicely on phones. */}
        <QRCodeCanvas value={url} includeMargin size={320} />
        <div className="flex gap-2 mt-2">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
