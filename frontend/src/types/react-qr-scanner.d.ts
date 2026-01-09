declare module 'react-qr-scanner' {
  import { Component, CSSProperties } from 'react';

  export interface QrScannerProps {
    delay?: number | false;
    onError: (error: any) => void;
    onScan: (data: { text: string } | null) => void;
    facingMode?: 'rear' | 'front';
    legacyMode?: boolean;
    maxImageSize?: number;
    style?: CSSProperties;
    className?: string;
    chooseDeviceId?: () => string;
  }

  export default class QrScanner extends Component<QrScannerProps> {}
}

