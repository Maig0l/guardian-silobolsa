import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { Silobolsa } from './Silobolsa';
import { Sensor } from './Sensor';

@Entity()
export class SilobolsaSensorLink {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Silobolsa)
  silobolsa!: Rel<Silobolsa>;

  @ManyToOne(() => Sensor)
  sensor!: Rel<Sensor>;

  @Property({ type: 'datetime' })
  fecha_instalacion!: Date;

  @Property({ type: 'string', default: 'ACTIVO' })
  estado!: string;

  @Property({ type: 'Date' })
  createdAt!: Date;

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(data: Partial<SilobolsaSensorLink>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
