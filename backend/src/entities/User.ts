import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Field } from './Field.js';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity({ tableName: 'usuario' })
export class User {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ length: 100, type: 'string' })
  nombre!: string;

  @Property({ length: 100, type: 'string' })
  apellido!: string;

  @Unique()
  @Property({ length: 150, type: 'string' })
  email!: string;

  @Property({ length: 255, hidden: true, type: 'string' })
  password!: string;

  @Property({ length: 20, nullable: true, type: 'string' })
  telefono?: string;

  @Property({ length: 20, default: UserRole.USER })
  role: string = UserRole.USER;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => Field, (field) => field.usuario)
  campos = new Collection<Field>(this);
}
