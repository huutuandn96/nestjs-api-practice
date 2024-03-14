import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';

const PORT = 3002
describe('App EndToEnd tests', () => {
  let app: INestApplication
  let prismaService: PrismaService
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = appModule.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await app.listen(PORT)
    prismaService = app.get(PrismaService)
    await prismaService.cleanDatabase()
    pactum.request.setBaseUrl(`http://localhost:${PORT}`)
  })

  describe('Test Authentication', () => {
    describe('Register', () => {
      it('should register successfully', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: 'testemail@example.com',
            password: '123456'
          })
          .expectStatus(201)
        // .inspect()
      })
      it('should show error with wrong format email', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: 'abc',
            password: '123456'
          })
          .expectStatus(400)
      })
      it('should show error with empty email', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: '',
            password: '123456'
          })
          .expectStatus(400)
      })
      it('should show error with empty password', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: 'testemail@example.com',
            password: ''
          })
          .expectStatus(400)
      })
    })

    describe('Login', () => {
      it('should login successfully', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            email: 'testemail@example.com',
            password: '123456'
          })
          .expectStatus(201)
          .stores('accessToken', "accessToken")
      })

      it('should login failed', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            email: 'testemail@example.com',
            password: '126'
          })
          .expectStatus(403)
      })
    })

    describe('Get detail user', () => {
      it('should get user info successfully', () => {
        return pactum.spec()
          .get('/users/me')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
      })
    })
  })

  afterAll(async () => {
    app.close()
  })
  it.todo('should PASS, haha');
})
