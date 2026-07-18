import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminUsersService } from '../services/admin-users.service';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.adminUsersService.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.adminUsersService.getOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
  ) {
    return this.adminUsersService.update(admin.id, id, dto);
  }
}
