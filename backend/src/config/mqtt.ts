import mqtt, { MqttClient } from 'mqtt';
import { config } from './index';

export class MqttService {
  private client: MqttClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.client = mqtt.connect(config.mqtt.brokerUrl, {
        clientId: config.mqtt.clientId,
        username: config.mqtt.username,
        password: config.mqtt.password,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Error connecting to MQTT broker:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.reconnectAttempts = 0;
      this.subscribeToTopics();
    });

    this.client.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
      this.handleReconnect();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  private subscribeToTopics(): void {
    if (!this.client) return;

    this.client.subscribe(config.mqtt.topic, (err) => {
      if (err) {
        console.error('Failed to subscribe to topic:', err);
      } else {
        console.log(`Subscribed to topic: ${config.mqtt.topic}`);
      }
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received message from topic ${topic}:`, data);
      
      // Emit event for sensor data processing
      this.emitSensorData(topic, data);
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }

  private emitSensorData(topic: string, data: any): void {
    // This will be handled by the main application
    // Emit a custom event or call a callback function
    if (global.sensorDataCallback) {
      global.sensorDataCallback(topic, data);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 5000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public publish(topic: string, message: string): void {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message);
    } else {
      console.error('MQTT client not connected');
    }
  }

  public isConnected(): boolean {
    return this.client?.connected || false;
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

// Extend global type for callback
declare global {
  var sensorDataCallback: ((topic: string, data: any) => void) | undefined;
}
