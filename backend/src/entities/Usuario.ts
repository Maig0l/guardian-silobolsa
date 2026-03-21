import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Campo } from './Campo';

@Entity()
export class Usuario {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  nombre!: string;

  @Property({ type: 'string' })
  apellido!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ type: 'string', hidden: true })
  password!: string;

  @Property({ type: 'string' })
  role!: string;

  @Property({ type: 'string', nullable: true })
  telefono?: string;

  @Property({ type: 'string', default: 'ACTIVO' })
  estado!: string;

  @Property({ type: 'Date' })
  createdAt!: Date;

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => Campo, campo => campo.usuario)
  campos = new Collection<Campo>(this);

  constructor(data: Partial<Usuario>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
