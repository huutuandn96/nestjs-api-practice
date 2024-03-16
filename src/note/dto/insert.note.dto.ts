import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class InsertNoteDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsString()
    @IsNotEmpty()
    url: string
}
