import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';

const bridge = window.Capacitor || Capacitor;
bridge.Plugins = bridge.Plugins || {};
bridge.Plugins.Camera = Camera;
bridge.Plugins.Geolocation = Geolocation;
bridge.Plugins.Network = Network;
bridge.Plugins.LocalNotifications = LocalNotifications;
window.Capacitor = bridge;
