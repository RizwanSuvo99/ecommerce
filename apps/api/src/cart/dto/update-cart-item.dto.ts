import { IsInt, Min, Max } from 'class-validator';

/**
 * DTO for updating a cart item's quantity.
 */
export class UpdateCartItemDto {
  /** New quantity (1-99) */
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}
