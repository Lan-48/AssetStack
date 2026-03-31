// asset.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('increment')
  id: number;

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

  @Column({ length: 50, nullable: false })
  category: string; // 分类

  @Column({ type: 'varchar', length: 20, nullable: true, default: '0.00' })
  additionalCost: string; // 附加费用，默认 "0.00"

  @Column({ type: 'text', nullable: true })
  description: string; // 备注

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
