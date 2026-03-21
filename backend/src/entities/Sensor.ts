import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field } from './Field.js';
import { SilobagSensorLink } from './SilobagSensorLink.js';
import { Reading } from './Reading.js';

export enum SensorStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  FALLA = 'FALLA',
}

@Entity({ tableName: 'sensor' })
export class Sensor {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Field)
  campo!: Field;

  @Property({ length: 100, type: 'string' })
  modelo!: string;

  @Unique()
  @Property({ length: 50, type: 'string' })
  mac_address!: string;

  @Property({ length: 64, type: 'string' })
  api_key!: string;

  @Property({ length: 20, default: SensorStatus.ACTIVO })
  estado: string = SensorStatus.ACTIVO;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => SilobagSensorLink, (link) => link.sensor)
  links = new Collection<SilobagSensorLink>(this);

  @OneToMany(() => Reading, (reading) => reading.sensor)
  lecturas = new Collection<Reading>(this);
}
