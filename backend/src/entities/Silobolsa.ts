import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Rel } from '@mikro-orm/core';
import { Campo } from './Campo';
import { SilobolsaSensorLink } from './SilobolsaSensorLink';

@Entity()
export class Silobolsa {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Campo)
  campo!: Rel<Campo>;

  @Property({ type: 'string' })
  marca!: string;

  @Property({ type: 'float' })
  capacidad_max!: number;

  @Property({ type: 'string' })
  ubicacion!: string;

  @Property({ type: 'string', nullable: true })
  observaciones?: string;

  @Property({ type: 'string', default: 'VACIO' })
  estado!: string;

  @Property({ type: 'string', nullable: true })
  grano?: string;

  @Property({ type: 'Date' })
  createdAt!: Date;

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => SilobolsaSensorLink, link => link.silobolsa)
  sensorLinks = new Collection<SilobolsaSensorLink>(this);

  constructor(data: Partial<Silobolsa>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
