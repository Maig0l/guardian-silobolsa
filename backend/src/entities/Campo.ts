import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Rel } from '@mikro-orm/core';
import { Usuario } from './Usuario';
import { Sensor } from './Sensor';
import { Silobolsa } from './Silobolsa';

@Entity()
export class Campo {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Usuario)
  usuario!: Rel<Usuario>;

  @Property()
  nombre!: string;

  @Property()
  ubicacion!: string;

  @Property({ default: 'ACTIVO' })
  estado!: string;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => Sensor, sensor => sensor.campo)
  sensores = new Collection<Sensor>(this);

  @OneToMany(() => Silobolsa, silobolsa => silobolsa.campo)
  silobolsas = new Collection<Silobolsa>(this);

  constructor(data: Partial<Campo>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
