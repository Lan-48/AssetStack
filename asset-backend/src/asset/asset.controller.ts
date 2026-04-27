// asset.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Headers,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { CreateAssetDto, UpdateAssetDto } from './dto';
import { AssetService, AssetPaginationResult } from './asset.service';
import { Asset } from './asset.entity';
import { LoginAuthGuard } from '../auth/login/login-auth.guard';
import { LoginService } from '../auth/login/login.service';

@ApiTags('资产管理')
@ApiHeader({
  name: 'token',
  required: true,
  description: '登录成功后返回的 token',
})
@UseGuards(LoginAuthGuard)
@Controller('asset')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly loginService: LoginService,
  ) {}

  private normalizeToken(raw: string | string[] | undefined): string {
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (typeof token !== 'string' || !token.trim()) {
      throw new UnauthorizedException('缺少 token');
    }
    return token.trim();
  }

  // 1. 新增资产 POST /asset/add
  @Post('add')
  @ApiOperation({ summary: '新增资产' })
  @ApiBody({ type: CreateAssetDto })
  @ApiResponse({ status: 200, description: '资产创建成功' })
  async create(
    @Headers('token') rawToken: string | string[] | undefined,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const asset = await this.assetService.create(createAssetDto, userId);
    return { code: 200, message: '资产创建成功', data: asset };
  }

  // 2. 获取资产列表 GET /asset/list?pageNum=1&pageSize=10&status=&category=
  @Get('list')
  @ApiOperation({ summary: '查询资产列表（支持分页、状态、分类筛选）' })
  @ApiQuery({ name: 'pageNum', required: false, type: String, example: '1' })
  @ApiQuery({ name: 'pageSize', required: false, type: String, example: '10' })
  @ApiQuery({ name: 'status', required: false, type: String, example: '在用' })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    example: '数码产品',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(
    @Headers('token') rawToken: string | string[] | undefined,
    @Query('pageNum') pageNum: string = '1',
    @Query('pageSize') pageSize: string = '100',
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const assets: AssetPaginationResult = await this.assetService.findAll(
      userId,
      parseInt(pageNum, 10),
      parseInt(pageSize, 10),
      status,
      category,
    );
    return { code: 200, message: '查询成功', data: assets };
  }

  // 3. 获取单个资产详情 GET /asset/detail?id=1
  @Get('detail')
  @ApiOperation({ summary: '获取资产详情' })
  @ApiQuery({ name: 'id', required: true, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '资产不存在' })
  async findOne(
    @Headers('token') rawToken: string | string[] | undefined,
    @Query('id', ParseIntPipe) id: number,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const asset = await this.assetService.findOne(id, userId);
    if (!asset) {
      throw new NotFoundException(`资产 ID ${id} 不存在`);
    }
    return { code: 200, message: '查询成功', data: asset };
  }

  // 4. 更新资产信息 PUT /asset/update?id=1
  @Put('update')
  @ApiOperation({ summary: '更新资产信息（支持部分字段更新）' })
  @ApiQuery({ name: 'id', required: true, type: Number, example: 1 })
  @ApiBody({ type: UpdateAssetDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '资产不存在' })
  async update(
    @Headers('token') rawToken: string | string[] | undefined,
    @Query('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const asset: Asset | null = await this.assetService.update(
      id,
      userId,
      updateAssetDto,
    );
    if (!asset) {
      throw new NotFoundException(`资产 ID ${id} 不存在`);
    }
    return { code: 200, message: '更新成功', data: asset };
  }

  // 5. 删除资产 DELETE /asset/delete?id=1
  @Delete('delete')
  @ApiOperation({ summary: '删除资产' })
  @ApiQuery({ name: 'id', required: true, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '资产不存在' })
  async remove(
    @Headers('token') rawToken: string | string[] | undefined,
    @Query('id', ParseIntPipe) id: number,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const exists = await this.assetService.findOne(id, userId);
    if (!exists) {
      throw new NotFoundException(`资产 ID ${id} 不存在`);
    }
    await this.assetService.remove(id, userId);
    return { code: 200, message: '删除成功' };
  }
}
