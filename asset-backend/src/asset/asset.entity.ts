// asset.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { User } from '../auth/user/user.entity';
import { AssetCategory } from '../asset-category/asset-category.entity';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** 与 user_id 列同步 */
  @RelationId((a: Asset) => a.user)
  userId: string;

  @Column({ length: 255, nullable: false })
  name: string; // 资产名称

  @Column({ type: 'varchar', length: 20, nullable: false })
  price: string; // 注意：用 string 避免精度问题（按文档要求）

  @Column({ type: 'date', nullable: false })
  purchaseDate: Date; // 购买日期

  @Column({ type: 'date', nullable: true })
  warrantyDate: Date; // 保修到期日，可为空

  @Column({ length: 20, nullable: false })
  status: string; // 枚举值：在用 / 闲置 / 预购入 / 退役

  /**
   * 关联资产分类表（二级或一级节点均可，以业务校验为准）。
   * 为空表示仅使用下方 category 文案（兼容旧数据或未走分类表的前端）。
   */
  @ManyToOne(() => AssetCategory, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  assetCategory: AssetCategory | null;

  @RelationId((a: Asset) => a.assetCategory)
  categoryId: number | null;

  /** 展示用分类名；与分类表关联时会与所选项 name 保持一致 */
  @Column({ length: 50, nullable: false })
  category: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: '0.00' })
  additionalCost: string; // 附加费用，默认 "0.00"

  @Column({ type: 'text', nullable: true })
  description: string; // 备注

  /** 封面图公网地址（与头像相同的上传接口写入对象存储后回写） */
  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl: string | null;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
