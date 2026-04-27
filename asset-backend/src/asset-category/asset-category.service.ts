import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Asset } from '../asset/asset.entity';
import { AssetCategory } from './asset-category.entity';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto';
import type { BatchSortItemDto } from './dto/batch-sort-asset-category.dto';
import { toCategorySnake } from './asset-category-serializer';

@Injectable()
export class AssetCategoryService {
  constructor(
    @InjectRepository(AssetCategory)
    private readonly categoryRepo: Repository<AssetCategory>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    private readonly dataSource: DataSource,
  ) {}

  private badRequest(msg: string): never {
    throw new HttpException({ code: 400, msg }, HttpStatus.BAD_REQUEST);
  }

  private async nameExists(
    userId: string,
    parentId: number | null,
    name: string,
    excludeId?: number,
  ): Promise<boolean> {
    const q = this.categoryRepo
      .createQueryBuilder('c')
      .where('c.user_id = :userId', { userId })
      .andWhere('c.name = :name', { name: name.trim() });
    if (parentId == null) {
      q.andWhere('c.parent_id IS NULL');
    } else {
      q.andWhere('c.parent_id = :parentId', { parentId });
    }
    if (excludeId != null) {
      q.andWhere('c.id != :excludeId', { excludeId });
    }
    const n = await q.getCount();
    return n > 0;
  }

  async findTree(userId: string): Promise<Record<string, unknown>[]> {
    const roots = await this.categoryRepo.find({
      where: { user: { id: userId }, parent: IsNull() },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const out: Record<string, unknown>[] = [];
    for (const r of roots) {
      const children = await this.categoryRepo.find({
        where: { user: { id: userId }, parent: { id: r.id } },
        order: { sortOrder: 'ASC', id: 'ASC' },
      });
      out.push(toCategorySnake(r, { children }));
    }
    return out;
  }

  async create(
    userId: string,
    dto: CreateAssetCategoryDto,
  ): Promise<Record<string, unknown>> {
    const name = dto.name.trim();
    const level = dto.category_level;

    if (level === 1 && dto.parent_id != null) {
      this.badRequest('一级分类不应指定 parent_id');
    }

    let parent: AssetCategory | null = null;
    let parentId: number | null = null;

    if (level === 2) {
      if (dto.parent_id == null) {
        this.badRequest('二级分类必须传 parent_id');
      }
      parent = await this.categoryRepo.findOne({
        where: { id: dto.parent_id, user: { id: userId }, parent: IsNull() },
      });
      if (!parent) {
        this.badRequest('父分类不存在');
      }
      if (parent.categoryLevel !== 1) {
        this.badRequest('父分类不存在');
      }
      parentId = parent.id;
    }

    if (await this.nameExists(userId, parentId, name)) {
      this.badRequest('分类名称重复');
    }

    const sortOrder = dto.sort_order ?? 0;
    const isDefault = dto.is_default === true;

    const row = this.categoryRepo.create({
      name,
      categoryLevel: level,
      parent: parentId != null ? { id: parentId } : null,
      user: { id: userId },
      sortOrder,
      isDefault,
      isSystem: false,
      itemCount: 0,
    });
    const saved = await this.categoryRepo.save(row);
    return toCategorySnake(saved);
  }

  async findOne(userId: string, id: number): Promise<Record<string, unknown>> {
    const row = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!row) {
      throw new HttpException(
        { code: 404, msg: '分类不存在' },
        HttpStatus.NOT_FOUND,
      );
    }
    return toCategorySnake(row);
  }

  async update(
    userId: string,
    id: number,
    dto: UpdateAssetCategoryDto,
  ): Promise<Record<string, unknown>> {
    const row = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!row) {
      throw new HttpException(
        { code: 404, msg: '分类不存在' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.isSystem) {
      this.badRequest('系统分类禁止修改');
    }

    if (dto.name !== undefined) {
      const nextName = dto.name.trim();
      if (await this.nameExists(userId, row.parentId ?? null, nextName, id)) {
        this.badRequest('分类名称重复');
      }
      row.name = nextName;
    }
    if (dto.sort_order !== undefined) {
      row.sortOrder = dto.sort_order;
    }

    if (dto.name === undefined && dto.sort_order === undefined) {
      return toCategorySnake(row);
    }

    const saved = await this.categoryRepo.save(row);
    return toCategorySnake(saved);
  }

  /** 统计当前用户挂在给定分类 id（可多个）上的资产数量 */
  private async countAssetsOnCategories(
    userId: string,
    categoryIds: number[],
  ): Promise<number> {
    if (!categoryIds.length) return 0;
    return this.assetRepo.count({
      where: {
        user: { id: userId },
        assetCategory: { id: In(categoryIds) },
      },
    });
  }

  async remove(userId: string, id: number): Promise<void> {
    const row = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!row) {
      throw new HttpException(
        { code: 404, msg: '分类不存在' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.isSystem) {
      this.badRequest('系统/默认分类禁止删除');
    }
    if (row.isDefault) {
      this.badRequest('系统/默认分类禁止删除');
    }

    const childIds =
      row.categoryLevel === 1
        ? (
            await this.categoryRepo.find({
              where: { user: { id: userId }, parent: { id: row.id } },
              select: { id: true },
            })
          ).map((c) => c.id)
        : [];

    const allIds = [row.id, ...childIds];
    if ((await this.countAssetsOnCategories(userId, allIds)) > 0) {
      this.badRequest('该分类下存在资产，无法删除');
    }

    await this.dataSource.transaction(async (manager) => {
      if (childIds.length) {
        await manager.softDelete(AssetCategory, { id: In(childIds) });
      }
      await manager.softDelete(AssetCategory, { id: row.id });
    });
  }

  async batchSort(userId: string, items: BatchSortItemDto[]): Promise<void> {
    if (!items?.length) {
      this.badRequest('请求参数错误');
    }
    const ids = items.map((i) => i.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      this.badRequest('请求参数错误');
    }

    const rows = await this.categoryRepo.find({
      where: { id: In(ids), user: { id: userId } },
      select: { id: true },
    });
    if (rows.length !== ids.length) {
      this.badRequest('存在无效的分类ID');
    }

    await this.dataSource.transaction(async (manager) => {
      for (const it of items) {
        await manager.update(
          AssetCategory,
          { id: it.id, user: { id: userId } },
          { sortOrder: it.sort_order },
        );
      }
    });
  }
}
