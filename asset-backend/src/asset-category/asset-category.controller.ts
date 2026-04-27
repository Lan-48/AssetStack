import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LoginAuthGuard } from '../auth/login/login-auth.guard';
import { LoginService } from '../auth/login/login.service';
import { AssetCategoryService } from './asset-category.service';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto,
  BatchSortItemDto,
} from './dto';

@ApiTags('资产分类')
@ApiHeader({
  name: 'token',
  required: true,
  description: '登录成功后返回的 token',
})
@UseGuards(LoginAuthGuard)
@Controller('asset-categories')
export class AssetCategoryController {
  constructor(
    private readonly categoryService: AssetCategoryService,
    private readonly loginService: LoginService,
  ) {}

  private normalizeToken(raw: string | string[] | undefined): string {
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (typeof token !== 'string' || !token.trim()) {
      throw new UnauthorizedException('缺少 token');
    }
    return token.trim();
  }

  @Get('tree')
  @ApiOperation({ summary: '资产分类 - 获取树形列表' })
  async tree(@Headers('token') rawToken: string | string[] | undefined) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const data = await this.categoryService.findTree(userId);
    return { code: 200, msg: 'success', data };
  }

  @Put('sort')
  @HttpCode(200)
  @ApiOperation({ summary: '资产分类 - 批量排序' })
  @ApiBody({
    description: '每项含 id 与 sort_order',
    type: [BatchSortItemDto],
  })
  async sort(
    @Headers('token') rawToken: string | string[] | undefined,
    @Body(
      new ParseArrayPipe({
        items: BatchSortItemDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    body: BatchSortItemDto[],
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    await this.categoryService.batchSort(userId, body);
    return { code: 200, msg: '排序修改成功', data: null };
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '资产分类 - 新增分类' })
  @ApiBody({ type: CreateAssetCategoryDto })
  async create(
    @Headers('token') rawToken: string | string[] | undefined,
    @Body() dto: CreateAssetCategoryDto,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const data = await this.categoryService.create(userId, dto);
    return { code: 200, msg: '分类创建成功', data };
  }

  @Get(':id')
  @ApiOperation({ summary: '资产分类 - 获取分类详情' })
  @ApiParam({ name: 'id', example: 1 })
  async findOne(
    @Headers('token') rawToken: string | string[] | undefined,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const data = await this.categoryService.findOne(userId, id);
    return { code: 200, msg: 'success', data };
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '资产分类 - 修改分类' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateAssetCategoryDto })
  async update(
    @Headers('token') rawToken: string | string[] | undefined,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetCategoryDto,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    const data = await this.categoryService.update(userId, id, dto);
    return { code: 200, msg: '分类修改成功', data };
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '资产分类 - 删除分类' })
  @ApiParam({ name: 'id', example: 1 })
  async remove(
    @Headers('token') rawToken: string | string[] | undefined,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const token = this.normalizeToken(rawToken);
    const userId = await this.loginService.getUserIdByToken(token);
    await this.categoryService.remove(userId, id);
    return { code: 200, msg: '分类删除成功', data: null };
  }
}
