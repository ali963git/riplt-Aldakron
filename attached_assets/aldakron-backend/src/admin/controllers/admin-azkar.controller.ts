import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminAzkarService } from '../services/admin-azkar.service';
import { CreateAzkarCategoryDto } from '../dto/create-azkar-category.dto';
import { CreateAzkarItemDto, UpdateAzkarItemDto } from '../dto/azkar-item.dto';

@ApiTags('admin/azkar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@Controller('admin/azkar')
export class AdminAzkarController {
  constructor(private readonly adminAzkarService: AdminAzkarService) {}

  @Post('categories')
  createCategory(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateAzkarCategoryDto) {
    return this.adminAzkarService.createCategory(admin.id, dto);
  }

  @Delete('categories/:id')
  @Roles('ADMIN') // deletion restricted to full admins, not editors
  deleteCategory(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    return this.adminAzkarService.deleteCategory(admin.id, id);
  }

  @Post('items')
  createItem(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateAzkarItemDto) {
    return this.adminAzkarService.createItem(admin.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAzkarItemDto,
  ) {
    return this.adminAzkarService.updateItem(admin.id, id, dto);
  }

  @Delete('items/:id')
  @Roles('ADMIN')
  deleteItem(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    return this.adminAzkarService.deleteItem(admin.id, id);
  }
}
