import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '用户ID（主键）' })
  id: string;

  @Column({
    type: 'varchar',
    length: 11,
    unique: true,
    comment: '手机号（唯一索引）',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '用户昵称',
  })
  nickname: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '头像URL',
  })
  avatar: string | null;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    name: 'password',
    comment: '密码（MD5加密，非必填，验证码登录可不用）',
  })
  password: string | null;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态：0-禁用，1-正常',
  })
  status: number;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    comment: '更新时间',
  })
  updateTime: Date;
}
