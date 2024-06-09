import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { RoomService } from './services/room.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../user/entities';

@Controller('rooms')
export class ChatConroller {
  constructor(private readonly roomService: RoomService) {}

  // Find all users
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved all rooms successfully.',
    type: [User],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Failed to retrieve rooms',
  })
  async findAll() {
    return await this.roomService.findAll();
  }
}
