import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InsertNoteDto, UpdateNoteDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoteService {
    constructor(private prismaService: PrismaService) {

    }

    async getNotes(userId: number) {
        return await this.prismaService.note.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                title: true,
                description: true,
                url: true
            }
        })
    }

    async getNoteById(noteId: number) {
        const note = await this.prismaService.note.findUnique({
            where: {
                id: noteId
            }
        })
        if (!note) {
            throw new NotFoundException('Could not found note')
        }
        return note
    }

    async insertNote(
        userId: number,
        insertNoteDto: InsertNoteDto
    ) {
        const note = await this.prismaService.note.create({
            data: {
                ...insertNoteDto,
                userId
            }
        })
        return note
    }

    async updateNoteById(
        noteId: number,
        updateNoteDto: UpdateNoteDto
    ) {
        const note = await this.prismaService.note.findUnique({
            where: {
                id: noteId
            }
        })
        if (!note) {
            throw new NotFoundException('Could not found note')
        }
        return this.prismaService.note.update({
            where: {
                id: noteId
            },
            data: { ...updateNoteDto }
        })
    }

    async deleteNoteById(noteId: number) {
        const note = await this.prismaService.note.findUnique({
            where: {
                id: noteId
            }
        })
        if (!note) {
            throw new NotFoundException('Could not found note')
        }
        return this.prismaService.note.delete({
            where: {
                id: noteId
            }
        })
    }
}
