import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Rel } from '@mikro-orm/core';
import { Campo } from './Campo';
import { SilobolsaSensorLink } from './SilobolsaSensorLink';
import { Lectura } from './Lectura';

@Entity()
export class Sensor {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Campo)
  campo!: Rel<Campo>;

  @Property({ type: 'string' })
  modelo!: string;

  @Property({ type: 'string', unique: true })
  mac_address!: string;

  @Property({ type: 'string', nullable: true })
  api_key?: string;

  @Property({ type: 'string', default: 'ACTIVO' })
  estado!: string;

  @Property({ type: 'Date' })
  createdAt!: Date;

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => SilobolsaSensorLink, link => link.sensor)
  silobolsaLinks = new Collection<SilobolsaSensorLink>(this);

  @OneToMany(() => Lectura, lectura => lectura.sensor)
  lecturas = new Collection<Lectura>(this);

  constructor(data: Partial<Sensor>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
