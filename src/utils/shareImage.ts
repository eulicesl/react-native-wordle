import { Share, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';

/** Capture options tuned for social media sharing (high-res PNG). */
export const SHARE_CAPTURE_OPTIONS = {
  format: 'png' as const,
  quality: 1,
  // react-native-view-shot renders at device pixel ratio by default;
  // snapshotContentContainer ensures the full card is captured.
  snapshotContentContainer: true,
};

export async function captureAndShare(viewRef: ViewShot): Promise<boolean> {
  try {
    const uri = await viewRef.capture?.();
    if (!uri) return false;

    if (Platform.OS === 'web') {
      return false;
    }

    const result = await Share.share({
      url: uri,
      ...(Platform.OS === 'ios' && { title: 'My WordVibe Results' }),
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.log('Error sharing image:', error);
    return false;
  }
}
