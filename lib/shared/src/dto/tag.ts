import { IsString } from "class-validator";

export interface TagDto {
    id: string;
    name: string;
    color: string;
}

export class CreateTagDto {
    @IsString()
    public name: string;

    @IsString()
    public color: string;
}
