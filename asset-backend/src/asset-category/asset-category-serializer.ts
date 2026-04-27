import { AssetCategory } from './asset-category.entity';

function formatTs(input: Date | string): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  const ms = p(d.getMilliseconds(), 3) + '000';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${ms}`;
}

/** 与 docs/API.md 约定的蛇形 JSON 一致 */
export function toCategorySnake(
  c: AssetCategory,
  options?: { children?: AssetCategory[] },
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: c.id,
    name: c.name,
    category_level: c.categoryLevel,
    is_default: c.isDefault ? 1 : 0,
    is_system: c.isSystem ? 1 : 0,
    sort_order: c.sortOrder,
    item_count: c.itemCount,
    created_at: formatTs(c.createdAt),
    updated_at: formatTs(c.updatedAt),
    deleted_at: c.deletedAt ? formatTs(c.deletedAt) : null,
    user_id: c.userId,
    parent_id: c.parentId,
  };
  if (options?.children !== undefined) {
    row['children'] = options.children.map((ch) => toCategorySnake(ch));
  }
  return row;
}
