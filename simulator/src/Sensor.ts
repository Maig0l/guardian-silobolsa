/** Modos de operación del sensor, igual que el simulador Python */
type SensorMode = 'NORMAL' | 'CALENTAMIENTO' | 'FALLA_SENSOR';

export interface SensorReading {
  hum: number | null;
  temp: number | null;
  co2: number | null;
  timestamp: string;
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class Sensor {
  readonly macAddress: string;
  readonly apiKey: string;

  private mode: SensorMode = 'NORMAL';
  private temp: number = 20;
  private hum: number = 10;
  private co2: number = 350;

  constructor(macAddress: string, apiKey: string) {
    this.macAddress = macAddress;
    this.apiKey = apiKey;
  }

  /** Avanza la simulación un tick */
  tick(): void {
    switch (this.mode) {
      case 'NORMAL':
        this.temp = round2(this.temp + rand(-0.1, 0.1));
        this.hum  = round2(this.hum  + rand(-0.05, 0.05));
        this.co2  = round2(this.co2  + rand(-5, 5));

        // 1% de probabilidad de cambiar a un modo de falla
        if (Math.random() < 0.01) {
          this.mode = Math.random() < 0.5 ? 'CALENTAMIENTO' : 'FALLA_SENSOR';
          console.log(`⚠️  [${this.macAddress}] Modo → ${this.mode}`);
        }
        break;

      case 'CALENTAMIENTO':
        // La humedad sube lentamente
        const deltaHum = rand(0.05, 0.1);
        this.hum  = round2(this.hum + deltaHum);

        // El CO2 sube proporcional a la humedad
        const deltaCo2 = (this.hum * 2.5) + randInt(10, 30);
        this.co2  = round2(this.co2 + deltaCo2);

        // La temperatura sube proporcional al CO2
        const deltaTemp = (deltaCo2 / 100) + rand(0.1, 0.3);
        this.temp = round2(this.temp + deltaTemp);

        if (this.temp > 45) {
          this.mode = 'FALLA_SENSOR';
          console.log(`🔥  [${this.macAddress}] Temperatura crítica (${this.temp}°C) → FALLA_SENSOR`);
        }
        break;

      case 'FALLA_SENSOR':
        this.temp = 0;
        this.hum  = 0;
        this.co2  = 0;

        // 10% de probabilidad de recuperarse
        if (Math.random() < 0.1) {
          this.mode = 'NORMAL';
          this.temp = 20;
          this.hum  = 10;
          this.co2  = 350;
          console.log(`✅  [${this.macAddress}] Sensor recuperado → NORMAL`);
        }
        break;
    }
  }

  /** Devuelve la lectura actual lista para publicar */
  reading(): SensorReading {
    return {
      hum:       this.hum,
      temp:      this.temp,
      co2:       this.co2,
      timestamp: new Date().toISOString(),
    };
  }

  get currentMode(): SensorMode {
    return this.mode;
  }
}
