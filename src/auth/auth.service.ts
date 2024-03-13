import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Note } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {

    }

    async register(authDto: AuthDto) {
        const hashedPassword = await argon.hash(authDto.password)
        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: authDto.email,
                    hashedPassword: hashedPassword,
                    firstName: '',
                    lastName: ''
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true
                }
            })
            return user
        } catch (error) {
            if (error.code == 'P2002') {
                throw new ForbiddenException('This email is already existed')
            }
        }
    }

    async login(authDto: AuthDto) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: authDto.email
            }
        })
        if (!user) {
            throw new ForbiddenException('Wrong password or email')
        }
        const passwordMatched = await argon.verify(
            user.hashedPassword, authDto.password
        )
        if (!passwordMatched) {
            throw new ForbiddenException('Wrong password or email')
        }
        return await this.signJwtToken(user.id, user.email)
    }

    async signJwtToken(userId: number, email: string): Promise<{accessToken: string}> {
        const payload = {
            sub: userId,
            email
        }
        const jwtString = await this.jwtService.signAsync(payload, {
            expiresIn: '10m',
            secret: this.configService.get('JWT_SECRET')
        })
        return {
            accessToken: jwtString
        }
    }
}