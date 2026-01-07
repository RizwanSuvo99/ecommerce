import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

/**
 * Represents a category with its nested children in a tree structure.
 */
export interface CategoryTreeNode {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  image: string | null;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  children: CategoryTreeNode[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a flattened category for use in dropdowns/selects.
 */
export interface CategoryFlat {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  parentId: string | null;
  depth: number;
  fullPath: string;
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Tree Operations ────────────────────────────────────────────────────────

  /**
   * Fetch all categories and build a tree structure.
   * Uses recursive assembly from a flat list for efficiency.
   */
  async findAll(): Promise<CategoryTreeNode[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Build a lookup map for O(n) tree assembly
    const nodeMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // First pass: create all nodes
    for (const category of categories) {
      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        nameBn: category.nameBn,
        slug: category.slug,
        image: category.image,
        description: category.description,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        productCount: category._count.products,
        children: [],
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
      nodeMap.set(category.id, node);
    }

    // Second pass: build the tree
    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    this.logger.debug(`Built category tree with ${roots.length} root nodes from ${categories.length} total categories`);

    return roots;
  }

  /**
   * Fetch all categories in a flat list for use in dropdowns.
   * Each item includes its depth level and the full path from root.
   */
  async findFlat(): Promise<CategoryFlat[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        nameBn: true,
        slug: true,
        parentId: true,
      },
    });

    // Build parent lookup
    const categoryMap = new Map<string, { name: string; parentId: string | null }>();
    for (const cat of categories) {
      categoryMap.set(cat.id, { name: cat.name, parentId: cat.parentId });
    }

    // Calculate depth and full path for each category
    const flatList: CategoryFlat[] = [];

    for (const cat of categories) {
      const path: string[] = [];
      let depth = 0;
      let currentId: string | null = cat.parentId;

      // Walk up the tree to build path and calculate depth
      while (currentId) {
        const parent = categoryMap.get(currentId);
        if (!parent) break;
        path.unshift(parent.name);
        currentId = parent.parentId;
        depth++;

        // Safety check to prevent infinite loops from bad data
        if (depth > 20) {
          this.logger.warn(`Possible circular reference detected for category ${cat.id}`);
          break;
        }
      }

      path.push(cat.name);

      flatList.push({
        id: cat.id,
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        parentId: cat.parentId,
        depth,
        fullPath: path.join(' > '),
      });
    }

    // Sort by full path for a natural tree ordering
    flatList.sort((a, b) => a.fullPath.localeCompare(b.fullPath));

    return flatList;
  }
}
