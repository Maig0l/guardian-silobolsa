import { Entity, PrimaryKey, Property, ManyToOne, Rel, Index } from '@mikro-orm/core';
import { Sensor } from './Sensor';

@Entity()
@Index({ properties: ['sensor', 'timestamp'] })
@Index({ properties: ['flag_alerta'] })
export class Lectura {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Sensor)
  sensor!: Rel<Sensor>;

  @Property({ type: 'datetime' })
  timestamp!: Date;

  @Property({ type: 'float' })
  co2!: number;

  @Property({ type: 'float' })
  temp!: number;

  @Property({ type: 'float' })
  humedad!: number;

  @Property({ default: false })
  flag_alerta!: boolean;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(data: Partial<Lectura>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
