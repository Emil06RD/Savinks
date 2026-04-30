import * as Application from 'expo-application';
import { Alert, Linking, Platform } from 'react-native';

const VERSION_URL =
  'https://raw.githubusercontent.com/Emil06RD/Savinks/refs/heads/main/version.json';

export async function checkForAppUpdate() {
  try {
    if (Platform.OS !== 'android') {
      return;
    }

    const response = await fetch(VERSION_URL);

    if (!response.ok) {
      console.log('No se pudo obtener version.json:', response.status);
      return;
    }

    const data = await response.json();
    const installedVersionCode = Number.parseInt(Application.nativeBuildVersion || '0', 10);
    const latestVersionCode = Number.parseInt(String(data.latestVersionCode || 0), 10);

    if (Number.isNaN(installedVersionCode) || Number.isNaN(latestVersionCode)) {
      console.log('No se pudo comparar la version instalada con la remota.');
      return;
    }

    if (latestVersionCode <= installedVersionCode) {
      return;
    }

    const openDownloadLink = async () => {
      try {
        if (!data.apkUrl) {
          Alert.alert('Actualizacion', 'El enlace del APK aun no esta disponible.');
          return;
        }

        const supported = await Linking.canOpenURL(data.apkUrl);

        if (!supported) {
          Alert.alert('Actualizacion', 'No se pudo abrir el enlace de descarga.');
          return;
        }

        await Linking.openURL(data.apkUrl);
      } catch (error) {
        console.log('Error al abrir el enlace del APK:', error);
      }
    };

    const buttons = [{ text: 'Descargar', onPress: openDownloadLink }];

    if (!data.required) {
      buttons.push({ text: 'Despues', style: 'cancel' });
    }

    Alert.alert('Nueva version disponible', data.message || 'Hay una nueva version disponible.', buttons, {
      cancelable: !data.required,
    });
  } catch (error) {
    console.log('Error al verificar actualizaciones:', error);
  }
}
