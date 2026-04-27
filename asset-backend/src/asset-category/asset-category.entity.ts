// asset-category.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  RelationId,
} from 'typeorm';
import { User } from '../auth/user/user.entity';

@Entity('asset_categories')
@Index('idx_user_parent', ['user', 'parent'])
@Index('idx_user_deleted', ['user', 'deletedAt'])
@Index('idx_user_parent_sort', ['user', 'parent', 'sortOrder'])
@Index('idx_parent', ['parent'])
export class AssetCategory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** 与 user_id 列同步，便于条件查询 */
  @RelationId((c: AssetCategory) => c.user)
  userId: string;

  @Column({ length: 50 })
  name: string;

  @ManyToOne(() => AssetCategory, (c) => c.children, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: AssetCategory | null;

  @RelationId((c: AssetCategory) => c.parent)
  parentId: number | null;

  @OneToMany(() => AssetCategory, (c) => c.parent)
  children: AssetCategory[];

  @Column({ name: 'category_level', type: 'tinyint', unsigned: true, default: 1 })
  categoryLevel: number;

  @Column({ name: 'is_default', type: 'tinyint', width: 1, default: 0 })
  isDefault: boolean;

  @Column({ name: 'is_system', type: 'tinyint', width: 1, default: 0 })
  isSystem: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'item_count', type: 'int', unsigned: true, default: 0 })
  itemCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
