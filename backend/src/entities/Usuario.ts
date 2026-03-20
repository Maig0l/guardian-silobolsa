import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Campo } from './Campo';

@Entity()
export class Usuario {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  role!: string;

  @Property({ nullable: true })
  telefono?: string;

  @Property({ default: 'ACTIVO' })
  estado!: string;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => Campo, campo => campo.usuario)
  campos = new Collection<Campo>(this);

  constructor(data: Partial<Usuario>) {
    Object.assign(this, data);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
