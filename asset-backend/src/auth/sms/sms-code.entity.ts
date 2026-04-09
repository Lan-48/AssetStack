import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sms_code')
@Index('idx_phone', ['phone'])
export class SmsCode {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键ID' })
  id: string;

  @Column({ type: 'varchar', length: 11, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 6, comment: '验证码' })
  code: string;

  @Column({
    name: 'expire_time',
    type: 'datetime',
    comment: '过期时间（5分钟）',
  })
  expireTime: Date;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '0-未用 1-已用',
  })
  used: number;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    precision: 6,
    comment: '创建时间',
  })
  createTime: Date;
}
