import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from './User.js';
import { Sensor } from './Sensor.js';
import { Silobag } from './Silobag.js';

export enum FieldStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity({ tableName: 'campo' })
export class Field {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => User)
  usuario!: User;

  @Property({ length: 150, type: 'string' })
  nombre!: string;

  @Property({ length: 255, type: 'string' })
  ubicacion!: string;

  @Property({ length: 20, default: FieldStatus.ACTIVO })
  estado: string = FieldStatus.ACTIVO;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => Sensor, (sensor) => sensor.campo)
  sensores = new Collection<Sensor>(this);

  @OneToMany(() => Silobag, (silobag) => silobag.campo)
  silobolsas = new Collection<Silobag>(this);
}
