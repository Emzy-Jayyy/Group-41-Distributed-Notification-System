import { Controller, Get, Post, Body, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -----------------------------------------------
  // Public Route — Register a New User
  // -----------------------------------------------
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // -----------------------------------------------
  // Protected Route — Get Current Authenticated User
  // -----------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    // The req.user comes from JwtStrategy.validate()
    return req.user;
  }

  // -----------------------------------------------
  // Protected Route — Get User by ID
  // -----------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // -----------------------------------------------
  // Protected Route — Get User Preferences
  // -----------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get(':id/preferences')
  async getPreferences(@Param('id') id: string) {
    return this.usersService.getPreferences(id);
  }

  // -----------------------------------------------
  // Protected Route — Update User Preferences
  // -----------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Put(':id/preferences')
  async updatePreferences(@Param('id') id: string, @Body() dto: UpdatePreferenceDto) {
    return this.usersService.updatePreferences(id, dto);
  }
}
