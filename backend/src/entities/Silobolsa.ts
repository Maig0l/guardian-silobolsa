import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Rel } from '@mikro-orm/core';
import { Campo } from './Campo';
import { SilobolsaSensorLink } from './SilobolsaSensorLink';

@Entity()
export class Silobolsa {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Campo)
  campo!: Rel<Campo>;

  @Property()
  marca!: string;

  @Property({ type: 'float' })
  capacidad_max!: number;

  @Property()
  ubicacion!: string;

  @Property({ nullable: true })
  observaciones?: string;

  @Property({ default: 'VACIO' })
  estado!: string;

  @Property({ nullable: true })
  grano?: string;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => SilobolsaSensorLink, link => link.silobolsa)
  sensorLinks = new Collection<SilobolsaSensorLink>(this);

  constructor(data: Partial<Silobolsa>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
