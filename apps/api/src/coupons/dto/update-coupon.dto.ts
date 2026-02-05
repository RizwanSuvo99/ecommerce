import { PartialType } from '@nestjs/mapped-types';

import { CreateCouponDto } from './create-coupon.dto';

/**
 * DTO for updating an existing coupon.
 * All fields are optional. All monetary values in BDT (৳).
 */
export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
