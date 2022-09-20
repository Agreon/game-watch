import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export interface TagDto {
    id: string;
    name: string;
    color: string;
}

export class CreateTagDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    public name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    public color: string;
}
