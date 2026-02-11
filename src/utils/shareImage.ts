import { Share, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';

export async function captureAndShare(viewRef: ViewShot): Promise<boolean> {
  try {
    const uri = await viewRef.capture?.();
    if (!uri) return false;

    if (Platform.OS === 'web') {
      // On web, fall back to text share
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
