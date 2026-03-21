import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Field } from './Field.js';
import { SilobagSensorLink } from './SilobagSensorLink.js';

export enum SilobagStatus {
  VACIO = 'VACIO',
  LLENO = 'LLENO',
  EN_USO = 'EN_USO',
  DAÑADO = 'DAÑADO',
  CERRADO = 'CERRADO',
}

export enum GrainType {
  SOJA = 'SOJA',
  MAIZ = 'MAIZ',
  TRIGO = 'TRIGO',
  GIRASOL = 'GIRASOL',
  SORGO = 'SORGO',
  CEBADA = 'CEBADA',
  OTRO = 'OTRO',
}

@Entity({ tableName: 'silobolsa' })
export class Silobag {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Field)
  campo!: Field;

  @Property({ length: 100, type: 'string' })
  marca!: string;

  @Property({ type: 'float' })
  capacidad_max!: number;

  @Property({ length: 200, type: 'string' })
  ubicacion!: string;

  @Property({ length: 50, nullable: true, type: 'string' })
  grano?: string;

  @Property({ type: 'text', nullable: true })
  observaciones?: string;

  @Property({ length: 20, default: SilobagStatus.VACIO })
  estado: string = SilobagStatus.VACIO;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => SilobagSensorLink, (link) => link.silobolsa)
  links = new Collection<SilobagSensorLink>(this);
}
