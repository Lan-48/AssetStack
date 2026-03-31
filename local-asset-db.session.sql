CREATE TABLE asset_categories (
    -- 主键
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    
    -- 分类名称
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    
    -- 分类层级控制
    parent_id INT UNSIGNED NULL DEFAULT NULL COMMENT '父分类ID，NULL表示一级分类',
    category_level TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '分类层级：1=一级分类，2=二级分类',
    
    -- 特殊标记
    is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为默认分类（资产未选分类时使用）',
    is_system BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为系统分类（不可删除）',
    
    -- 元数据
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值（从小到大）',
    item_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '该分类下的资产数量（缓存）',
    
    -- 时间戳
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
    
    -- 外键约束（自关联）
    CONSTRAINT fk_category_parent 
        FOREIGN KEY (parent_id) 
        REFERENCES asset_categories(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 唯一约束：同一父分类下不能有同名分类
    CONSTRAINT uq_category_name_parent 
        UNIQUE KEY (name, parent_id),
    
    -- 索引
    INDEX idx_parent_id (parent_id),
    INDEX idx_category_level (category_level),
    INDEX idx_is_default (is_default),
    INDEX idx_is_system (is_system),
    INDEX idx_sort_order (sort_order),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产分类表（最多支持二级分类）';