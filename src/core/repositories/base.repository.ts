import { ObjectLiteral } from 'typeorm';
import { BaseRepository as AbstractRepository } from '@diginexhk/typeorm-helper';

export abstract class BaseRepository<Entity extends ObjectLiteral> extends AbstractRepository<Entity> {}
