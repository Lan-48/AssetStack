// asset.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindOptionsWhere,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';
import { OssService } from '../oss/oss.service';
import { AssetCategory } from '../asset-category/asset-category.entity';
import { Asset } from './asset.entity';
import { CreateAssetDto, UpdateAssetDto } from './dto';

export interface AssetPaginationResult {
  list: Asset[];
  total: number;
  page: number;
  size: number;
}

const ASSET_UPDATE_KEYS = [
  'name',
  'price',
  'purchaseDate',
  'warrantyDate',
  'status',
  'category',
  'description',
  'additionalCost',
  'imageUrl',
  'categoryId',
] as const;

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(AssetCategory)
    private categoryRepository: Repository<AssetCategory>,
    private readonly ossService: OssService,
  ) {}

  private normalizeImageUrlForStore(
    raw: string | null | undefined,
  ): string | null {
    if (raw == null || raw === '') return null;
    const t = String(raw).trim();
    if (!t) return null;
    return this.ossService.normalizeToObjectKey(t) ?? t;
  }

  private async assertCategoryOwned(
    userId: string,
    categoryId: number,
  ): Promise<AssetCategory> {
    const row = await this.categoryRepository.findOne({
      where: { id: categoryId, user: { id: userId } },
    });
    if (!row) {
      throw new BadRequestException('分类不存在或无权限');
    }
    return row;
  }

  private async adjustCategoryItemCount(
    categoryId: number,
    delta: number,
  ): Promise<void> {
    if (delta === 0) return;
    const cat = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!cat) return;
    cat.itemCount = Math.max(0, (cat.itemCount ?? 0) + delta);
    await this.categoryRepository.save(cat);
  }

  private async mapAssetForResponse(asset: Asset): Promise<Asset> {
    const prev = asset.imageUrl;
    const next =
      prev == null || prev === ''
        ? prev
        : await this.ossService.signImageUrlForRead(prev);
    const rest = { ...asset };
    delete (rest as { user?: unknown }).user;
    delete (rest as { assetCategory?: unknown }).assetCategory;
    return { ...rest, imageUrl: next } as Asset;
  }

  async create(createAssetDto: CreateAssetDto, userId: string): Promise<Asset> {
    const rest = { ...createAssetDto };
    const categoryIdOpt = rest.categoryId;
    delete rest.categoryId;

    const packed = rest as Record<string, unknown>;
    if (packed['imageUrl'] !== undefined) {
      const raw = packed['imageUrl'];
      const t = typeof raw === 'string' ? raw.trim() : '';
      if (t === '') {
        delete packed['imageUrl'];
      } else {
        packed['imageUrl'] = this.normalizeImageUrlForStore(t) ?? undefined;
      }
    }

    let categoryLabel: string;
    let linkId: number | null = null;
    if (categoryIdOpt != null && categoryIdOpt >= 1) {
      const cat = await this.assertCategoryOwned(userId, categoryIdOpt);
      categoryLabel = cat.name;
      linkId = categoryIdOpt;
    } else {
      const t = createAssetDto.category?.trim();
      if (!t) {
        throw new BadRequestException('分类不能为空');
      }
      categoryLabel = t;
    }

    const asset = this.assetRepository.create({
      ...(packed as DeepPartial<Asset>),
      category: categoryLabel,
      user: { id: userId },
      assetCategory: linkId != null ? { id: linkId } : null,
    } satisfies DeepPartial<Asset>);
    const saved = await this.assetRepository.save(asset);
    if (linkId != null) {
      await this.adjustCategoryItemCount(linkId, 1);
    }
    return await this.mapAssetForResponse(saved);
  }

  async findAll(
    userId: string,
    page: number,
    size: number,
    status?: string,
    category?: string,
  ): Promise<AssetPaginationResult> {
    const skip = (page - 1) * size;
    const take = size;

    const where: FindOptionsWhere<Asset> = {
      user: { id: userId },
    };

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const [assets, total] = await this.assetRepository.findAndCount({
      where,
      skip,
      take,
    });

    const list = await Promise.all(
      assets.map((a) => this.mapAssetForResponse(a)),
    );
    return {
      list,
      total,
      page,
      size,
    };
  }

  async findOne(id: number, userId: string): Promise<Asset | null> {
    const row = await this.assetRepository.findOne({
      where: { id, user: { id: userId } },
    });
    return row ? await this.mapAssetForResponse(row) : null;
  }

  async update(
    id: number,
    userId: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset | null> {
    const dto = { ...updateAssetDto };
    const packed = dto as Record<string, unknown>;
    if (packed['imageUrl'] !== undefined) {
      const raw = packed['imageUrl'];
      const t = raw === null ? '' : typeof raw === 'string' ? raw.trim() : '';
      if (t === '') {
        packed['imageUrl'] = null;
      } else {
        packed['imageUrl'] = this.normalizeImageUrlForStore(t);
      }
    }

    const existing = await this.assetRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!existing) {
      return null;
    }
    const prevCatId = existing.categoryId ?? null;

    if (packed['categoryId'] !== undefined) {
      const raw = packed['categoryId'];
      if (raw === null) {
        packed['categoryId'] = null;
        if (prevCatId != null) {
          await this.adjustCategoryItemCount(prevCatId, -1);
        }
        if (typeof packed['category'] === 'string') {
          packed['category'] = packed['category'].trim();
        }
      } else {
        const nextId = Number(raw);
        const cat = await this.assertCategoryOwned(userId, nextId);
        packed['categoryId'] = nextId;
        packed['category'] = cat.name;
        if (prevCatId !== nextId) {
          if (prevCatId != null) {
            await this.adjustCategoryItemCount(prevCatId, -1);
          }
          await this.adjustCategoryItemCount(nextId, 1);
        }
      }
    } else if (typeof packed['category'] === 'string') {
      packed['category'] = packed['category'].trim();
    }

    const patch: QueryDeepPartialEntity<Asset> = {};
    for (const key of ASSET_UPDATE_KEYS) {
      if (key === 'categoryId') {
        // categoryId 仅 @RelationId，直接写入 patch 时 TypeORM 对 update 不生成合法外键列更新，会 500
        continue;
      }
      if (packed[key] !== undefined) {
        (patch as Record<string, unknown>)[key] = packed[key];
      }
    }
    if (packed['categoryId'] !== undefined) {
      const cid = packed['categoryId'] as number | null;
      patch.assetCategory = cid == null ? null : { id: cid };
    }

    if (Object.keys(patch).length === 0) {
      const row = await this.assetRepository.findOne({
        where: { id, user: { id: userId } },
      });
      return row ? await this.mapAssetForResponse(row) : null;
    }

    await this.assetRepository.update({ id, user: { id: userId } }, patch);
    const row = await this.assetRepository.findOne({
      where: { id, user: { id: userId } },
    });
    return row ? await this.mapAssetForResponse(row) : null;
  }

  async remove(id: number, userId: string): Promise<void> {
    const row = await this.assetRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (row?.categoryId != null) {
      await this.adjustCategoryItemCount(row.categoryId, -1);
    }
    await this.assetRepository
      .createQueryBuilder()
      .delete()
      .from(Asset)
      .where('id = :id AND user_id = :userId', { id, userId })
      .execute();
  }
}
