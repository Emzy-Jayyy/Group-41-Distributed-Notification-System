import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Unique key for the template' })
  template_key: string;

  @ApiPropertyOptional({ description: 'Description of the template' })
  description?: string;
}

export class CreateTemplateVersionDto {
  @ApiProperty({ description: 'Content of the template version' })
  content: string;

  @ApiProperty({ description: 'Language code of the template version' })
  language: string;
}
