import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * DTO for adding an item to the shopping cart.
 */
export class AddCartItemDto {
  /** Product ID to add */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /** Optional variant ID (e.g., specific size/color) */
  @IsString()
  @IsOptional()
  variantId?: string;

  /** Quantity to add (1-99) */
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}
