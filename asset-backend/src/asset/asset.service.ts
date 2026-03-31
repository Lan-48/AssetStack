// asset.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './asset.entity';
import { CreateAssetDto, UpdateAssetDto } from './dto';

// 新增：定义findAll方法的返回类型接口
export interface AssetPaginationResult {
  list: Asset[];
  total: number;
  page: number;
  size: number;
}

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetRepository.create(createAssetDto);
    return this.assetRepository.save(asset);
  }

  // 修改：将返回类型从any改为明确的AssetPaginationResult
  async findAll(
    page: number,
    size: number,
    status?: string,
    category?: string,
  ): Promise<AssetPaginationResult> {
    const skip = (page - 1) * size;
    const take = size;

    const where: Partial<Asset> = {};

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

    return {
      list: assets,
      total,
      page,
      size,
    };
  }

  async findOne(id: number): Promise<Asset | null> {
    return this.assetRepository.findOneBy({ id });
  }

  // 修改：将返回类型改为Promise<Asset | null>
  async update(
    id: number,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset | null> {
    await this.assetRepository.update(id, updateAssetDto);
    return this.assetRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.assetRepository.delete(id);
  }
}
