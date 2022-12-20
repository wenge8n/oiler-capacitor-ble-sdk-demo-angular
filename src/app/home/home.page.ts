import { Component } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { BleClient, BleDevice, dataViewToText, numberToUUID, ScanResult } from '@capacitor-community/bluetooth-le';

import { DataService, Message } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  device?: BleDevice;
  deviceName?: string;
  error?: any;
  isScanningWithFilter = false;
  isScanningWithoutFilter = false;
  bluetoothScanResults: ScanResult[] = [];

  readonly testServiceUUID = numberToUUID(0x1800);
  readonly testCharacteristicUUID = numberToUUID(0x2a29);

  constructor(private data: DataService) { }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }

  async scanWithoutServicesFilter() {
    try {
      this.bluetoothScanResults = [];
      this.isScanningWithoutFilter = true;

      await BleClient.initialize({ androidNeverForLocation: true });

      await BleClient.requestLEScan(
        {
          services: [],
        },
        (result) => {
          console.log('received new scan result', result);
          this.bluetoothScanResults.push(result);
        }
      );

      setTimeout(async () => {
        await BleClient.stopLEScan();
        console.log('stopped scanning');
        this.isScanningWithoutFilter = false;
      }, 5000);
    } catch (error) {
      console.log('err', error)
      this.error = error;
      this.isScanningWithoutFilter = false;
    }
  }

  async scanWithServicesFilter() {
    try {
      this.bluetoothScanResults = [];
      this.isScanningWithFilter = true;

      await BleClient.initialize({ androidNeverForLocation: true });

      await BleClient.requestLEScan(
        {
          services: [this.testServiceUUID],
        },
        (result) => {
          console.log('received new scan result', result);
          this.bluetoothScanResults.push(result);
        }
      );

      setTimeout(async () => {
        await BleClient.stopLEScan();
        console.log('stopped scanning');
        this.isScanningWithFilter = false;
      }, 5000);
    } catch (error) {
      console.log('err', error)
      this.error = error;
      this.isScanningWithFilter = false;
    }
  }

  async connectDevice() {
    try {
      await BleClient.initialize();

      const device = await BleClient.requestDevice({
        services: [this.testServiceUUID],
      });

      await BleClient.connect(device.deviceId, (deviceId) => console.log("Device disconnected - " + deviceId));
      console.log('connected to device', device);

      this.deviceName = dataViewToText(await BleClient.read(device.deviceId, this.testServiceUUID, this.testCharacteristicUUID));
      console.log('deviceName - ', this.deviceName);      
    } catch (error) {
      console.log('err', error)
      this.error = error;
    }
  }

  async disconnectDevice() {
    try {
      if (this.device) {
        await BleClient.disconnect(this.device.deviceId);
      }      
    } catch (error) {
      console.log('err', error)
      this.error = error;
    }
  }

}
